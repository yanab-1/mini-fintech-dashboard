const STYLES = {
  warning: {
    badge: 'bg-expense/10 text-expense',
    label: 'Heads up',
  },
  positive: {
    badge: 'bg-income/10 text-income',
    label: 'On track',
  },
  info: {
    badge: 'bg-brand/10 text-brand',
    label: 'Insight',
  },
  empty: {
    badge: 'bg-muted/10 text-muted',
    label: 'Getting started',
  },
};

function InsightCard({ insight, loading }) {
  const style = STYLES[insight?.type] || STYLES.info;

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.badge}`}>{style.label}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink">
        {loading ? 'Crunching the numbers…' : insight?.message || 'No insight available yet.'}
      </p>
    </section>
  );
}

export default InsightCard;
