const assert = require('node:assert/strict');
const app = require('../server');

const baseFetch = async (baseUrl, path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let body = null;
  const text = await response.text();
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  return { response, body };
};

const run = async () => {
  process.env.USE_MEMORY_DB = 'true';

  const server = app.listen(0);
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}/api`;

  try {
    // Health
    let result = await baseFetch(baseUrl, '/health');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.success, true);

    // Empty list
    result = await baseFetch(baseUrl, '/transactions');
    assert.equal(result.response.status, 200);
    assert.equal(Array.isArray(result.body.data), true);
    assert.equal(result.body.data.length, 0);

    // Create expense
    const payload = {
      amount: 1250.5,
      type: 'expense',
      category: 'Food',
      date: '2026-06-14',
      note: 'Test groceries',
    };
    result = await baseFetch(baseUrl, '/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    assert.equal(result.response.status, 201);
    assert.equal(result.body.success, true);
    const createdId = result.body.data._id;

    // List
    result = await baseFetch(baseUrl, '/transactions');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.length, 1);

    // Get by id
    result = await baseFetch(baseUrl, `/transactions/${createdId}`);
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.category, 'Food');

    // Update
    result = await baseFetch(baseUrl, `/transactions/${createdId}`, {
      method: 'PUT',
      body: JSON.stringify({ note: 'Updated groceries', amount: 1300 }),
    });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.note, 'Updated groceries');
    assert.equal(result.body.data.amount, 1300);

    // Summary
    result = await baseFetch(baseUrl, '/transactions/summary');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.totalExpense, 1300);

    // Insight
    result = await baseFetch(baseUrl, '/transactions/insight');
    assert.equal(result.response.status, 200);
    assert.equal(typeof result.body.data.message, 'string');

    // Delete
    result = await baseFetch(baseUrl, `/transactions/${createdId}`, { method: 'DELETE' });
    assert.equal(result.response.status, 200);

    // Confirm empty again
    result = await baseFetch(baseUrl, '/transactions');
    assert.equal(result.body.data.length, 0);

    console.log('API test suite passed.');
  } finally {
    server.close();
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
