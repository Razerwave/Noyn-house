export default function AdminLoading() {
  return (
    <div className="admin-body admin-loading" role="status" aria-label="Админ хуудас ачаалж байна">
      <div className="admin-loading-mobile"><span /></div>
      <div className="admin-shell">
        <aside className="admin-side admin-loading-side" aria-hidden="true">
          <div className="admin-loading-logo" />
          <div className="admin-loading-nav">
            {Array.from({ length: 8 }, (_, index) => <span key={index} />)}
          </div>
        </aside>
        <main className="admin-main">
          <div className="admin-loading-heading"><span /><i /></div>
          <div className="admin-loading-metrics">
            {Array.from({ length: 4 }, (_, index) => <span key={index} />)}
          </div>
          <div className="admin-loading-panel" />
        </main>
      </div>
    </div>
  );
}
