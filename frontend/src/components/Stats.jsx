export default function Stats({ totalLinks, totalClicks }) {
  return (
    <div className="stats">
      <div className="card stat">
        <span className="stat-icon">🔗</span>
        <div>
          <div className="stat-value">{totalLinks}</div>
          <div className="stat-label">Links created</div>
        </div>
      </div>
      <div className="card stat">
        <span className="stat-icon">👆</span>
        <div>
          <div className="stat-value">{totalClicks}</div>
          <div className="stat-label">Total clicks</div>
        </div>
      </div>
    </div>
  );
}
