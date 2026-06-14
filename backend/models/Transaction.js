const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Housing',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Health',
  'Education',
  'Other',
];

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be either "income" or "expense"',
      },
      required: [true, 'Type is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      default: '',
      maxlength: [280, 'Note cannot exceed 280 characters'],
    },
  },
  { timestamps: true }
);

transactionSchema.index({ date: -1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ type: 1 });

const MongooseTransaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

// ---- In-memory fallback ---------------------------------------------------
// Used when MongoDB is unavailable so the app and APIs remain functional.
const memoryStore = [];

const isMemoryMode = () => process.env.USE_MEMORY_DB === 'true' || mongoose.connection.readyState !== 1;

const toDate = (value) => (value instanceof Date ? new Date(value.getTime()) : new Date(value));

const cloneDocument = (doc) => ({
  _id: doc._id,
  amount: doc.amount,
  type: doc.type,
  category: doc.category,
  date: toDate(doc.date),
  note: doc.note ?? '',
  createdAt: toDate(doc.createdAt),
  updatedAt: toDate(doc.updatedAt),
});

const matchesFilter = (doc, filter = {}) => {
  if (!filter || Object.keys(filter).length === 0) return true;

  if (filter.type && doc.type !== filter.type) return false;

  if (filter.category) {
    if (filter.category instanceof RegExp) {
      if (!filter.category.test(doc.category)) return false;
    } else if (typeof filter.category === 'object' && filter.category.$regex) {
      const regex = new RegExp(filter.category.$regex, filter.category.$options || '');
      if (!regex.test(doc.category)) return false;
    } else if (String(doc.category) !== String(filter.category)) {
      return false;
    }
  }

  if (filter.date) {
    const docDate = new Date(doc.date);
    if (filter.date.$gte && docDate < new Date(filter.date.$gte)) return false;
    if (filter.date.$lte && docDate > new Date(filter.date.$lte)) return false;
  }

  return true;
};

const compareWithSortSpec = (a, b, sortSpec = {}) => {
  const entries = Object.entries(sortSpec);
  for (const [field, direction] of entries) {
    const dir = direction >= 0 ? 1 : -1;
    const aValue = a[field];
    const bValue = b[field];

    let cmp = 0;
    if (aValue instanceof Date || bValue instanceof Date || field.toLowerCase().includes('date')) {
      cmp = new Date(aValue).getTime() - new Date(bValue).getTime();
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      cmp = aValue - bValue;
    } else {
      cmp = String(aValue ?? '').localeCompare(String(bValue ?? ''));
    }

    if (cmp !== 0) return cmp * dir;
  }
  return 0;
};

const normalizePayload = (payload = {}) => {
  const now = new Date();
  return {
    _id: payload._id || randomUUID(),
    amount: Number(payload.amount),
    type: payload.type,
    category: payload.category,
    date: payload.date ? new Date(payload.date) : new Date(),
    note: payload.note ?? '',
    createdAt: payload.createdAt ? new Date(payload.createdAt) : now,
    updatedAt: now,
  };
};

class MemoryTransactionDocument {
  constructor(payload) {
    Object.assign(this, normalizePayload(payload));
  }

  async save() {
    const idx = memoryStore.findIndex((item) => item._id === this._id);
    this.updatedAt = new Date();

    if (idx === -1) {
      memoryStore.push(cloneDocument(this));
    } else {
      memoryStore[idx] = cloneDocument(this);
    }

    return this;
  }

  async deleteOne() {
    const idx = memoryStore.findIndex((item) => item._id === this._id);
    if (idx !== -1) {
      memoryStore.splice(idx, 1);
    }
    return { acknowledged: true, deletedCount: idx === -1 ? 0 : 1 };
  }

  toJSON() {
    return cloneDocument(this);
  }
}

class MemoryQuery {
  constructor(filter = {}) {
    this.filter = filter;
    this.sortSpec = {};
  }

  sort(sortSpec = {}) {
    this.sortSpec = sortSpec;
    return this;
  }

  exec() {
    const result = memoryStore
      .filter((doc) => matchesFilter(doc, this.filter))
      .map((doc) => cloneDocument(doc))
      .sort((a, b) => compareWithSortSpec(a, b, this.sortSpec));

    return Promise.resolve(result);
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

const MemoryTransaction = {
  create: async (payload) => {
    const doc = new MemoryTransactionDocument(payload);
    memoryStore.push(cloneDocument(doc));
    return doc;
  },

  find: (filter = {}) => new MemoryQuery(filter),

  findById: async (id) => {
    const found = memoryStore.find((doc) => doc._id === String(id));
    return found ? new MemoryTransactionDocument(found) : null;
  },

  deleteMany: async (filter = {}) => {
    const before = memoryStore.length;
    if (!filter || Object.keys(filter).length === 0) {
      memoryStore.length = 0;
    } else {
      for (let i = memoryStore.length - 1; i >= 0; i -= 1) {
        if (matchesFilter(memoryStore[i], filter)) {
          memoryStore.splice(i, 1);
        }
      }
    }
    return { acknowledged: true, deletedCount: before - memoryStore.length };
  },

  insertMany: async (docs = []) => {
    const inserted = docs.map((doc) => {
      const instance = new MemoryTransactionDocument(doc);
      memoryStore.push(cloneDocument(instance));
      return instance;
    });
    return inserted;
  },
};

const Transaction = new Proxy(MongooseTransaction, {
  get(target, prop, receiver) {
    if (!isMemoryMode()) {
      const value = Reflect.get(target, prop, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    }

    const memoryValue = MemoryTransaction[prop];
    if (memoryValue !== undefined) {
      return typeof memoryValue === 'function' ? memoryValue.bind(MemoryTransaction) : memoryValue;
    }

    const targetValue = Reflect.get(target, prop, receiver);
    return typeof targetValue === 'function' ? targetValue.bind(target) : targetValue;
  },
});

module.exports = Transaction;
module.exports.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;
module.exports.INCOME_CATEGORIES = INCOME_CATEGORIES;
module.exports.__memory = {
  memoryStore,
  MemoryTransactionDocument,
  matchesFilter,
  normalizePayload,
};
