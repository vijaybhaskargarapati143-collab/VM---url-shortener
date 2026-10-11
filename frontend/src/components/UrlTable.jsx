import CopyButton from "./CopyButton.jsx";

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UrlTable({ urls, loading, onDelete, onRefresh }) {
  return (
    <div className="card table-card">
      <div className="table-header">
        <h2>Your links</h2>
        <button className="btn btn-small btn-secondary" onClick={onRefresh}>
          ↻ Refresh clicks
        </button>
      </div>

      {loading ? (
        <p className="empty">Loading your links…</p>
      ) : urls.length === 0 ? (
        <p className="empty">No links yet. Shorten your first URL above! 👆</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Original URL</th>
                <th>Short URL</th>
                <th>Created</th>
                <th className="num">Clicks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {urls.map((u) => (
                <tr key={u.id}>
                  <td data-label="Original" className="cell-original" title={u.originalUrl}>
                    {u.originalUrl}
                  </td>
                  <td data-label="Short">
                    <a href={u.shortUrl} target="_blank" rel="noopener noreferrer">
                      {u.shortUrl.replace(/^https?:\/\//, "")}
                    </a>
                  </td>
                  <td data-label="Created">{formatDate(u.createdAt)}</td>
                  <td data-label="Clicks" className="num">
                    <span className="badge">{u.clicks}</span>
                  </td>
                  <td data-label="Actions">
                    <div className="row-actions">
                      <CopyButton text={u.shortUrl} small />
                      <button className="btn btn-small btn-danger" onClick={() => onDelete(u.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
