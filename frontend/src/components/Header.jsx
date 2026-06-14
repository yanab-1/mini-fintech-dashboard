function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <path d="M9 9H23" stroke="#F4F6F2" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M9 16H19" stroke="#F4F6F2" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M9 23H23" stroke="#2F9E5B" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight text-ink">Ledger</h1>
            <p className="text-xs text-muted">A quiet place to track where your money goes</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
