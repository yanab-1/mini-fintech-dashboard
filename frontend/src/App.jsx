import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header';
import SummaryStrip from './components/SummaryStrip';
import TransactionForm from './components/TransactionForm';
import FilterBar from './components/FilterBar';
import CategoryChart from './components/CategoryChart';
import InsightCard from './components/InsightCard';
import TransactionList from './components/TransactionList';
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  getSummary,
  getInsight,
} from './services/api';

const initialFilters = {
  type: '',
  category: '',
  startDate: '',
  endDate: '',
};

function App() {
  const [filters, setFilters] = useState(initialFilters);

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [insight, setInsight] = useState(null);

  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingInsight, setLoadingInsight] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoadingTransactions(true);
    setLoadingSummary(true);
    setLoadingInsight(true);
    setError('');

    try {
      const [txData, summaryData, insightData] = await Promise.all([
        getTransactions(filters),
        getSummary(filters),
        getInsight(filters),
      ]);
      setTransactions(txData);
      setSummary(summaryData);
      setInsight(insightData);
    } catch (err) {
      setError(
        err?.code === 'ERR_NETWORK'
          ? 'Could not reach the API. Make sure the backend server is running.'
          : err?.response?.data?.message || 'Something went wrong while loading your data.'
      );
    } finally {
      setLoadingTransactions(false);
      setLoadingSummary(false);
      setLoadingInsight(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddTransaction = async (payload) => {
    setSubmitting(true);
    try {
      await createTransaction(payload);
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not delete that transaction.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearFilters = () => setFilters(initialFilters);

  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {error && (
          <div role="alert" className="rounded-lg border border-expense/30 bg-expense/5 px-4 py-3 text-sm text-expense">
            {error}
          </div>
        )}

        <SummaryStrip summary={summary} loading={loadingSummary} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <TransactionForm onAdd={handleAddTransaction} submitting={submitting} />
          </div>

          <div className="space-y-6 lg:col-span-2">
            <FilterBar filters={filters} onChange={setFilters} onClear={handleClearFilters} />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <CategoryChart data={summary?.categoryBreakdown} loading={loadingSummary} />
              <InsightCard insight={insight} loading={loadingInsight} />
            </div>
          </div>
        </div>

        <TransactionList
          transactions={transactions}
          loading={loadingTransactions}
          onDelete={handleDeleteTransaction}
          deletingId={deletingId}
        />
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-muted sm:px-6">
        Mini Fintech Dashboard — built with the MERN stack.
      </footer>
    </div>
  );
}

export default App;
