import CopyButton from "./CopyButton.jsx";

export default function ResultCard({ result }) {
  return (
    <div className="card result-card" role="status">
      <p className="success-msg">✅ Your short link is ready!</p>
      <div className="result-row">
        <a className="short-url" href={result.shortUrl} target="_blank" rel="noopener noreferrer">
          {result.shortUrl}
        </a>
        <div className="result-actions">
          <CopyButton text={result.shortUrl} />
          <a className="btn btn-secondary" href={result.shortUrl} target="_blank" rel="noopener noreferrer">
            Open ↗
          </a>
        </div>
      </div>
      <p className="original-preview" title={result.originalUrl}>
        Original: {result.originalUrl}
      </p>
    </div>
  );
}
