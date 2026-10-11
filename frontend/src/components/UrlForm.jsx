import { useState } from "react";

export default function UrlForm({ onSubmit, loading }) {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [showAlias, setShowAlias] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await onSubmit(url.trim(), alias.trim());
    if (ok) {
      setUrl("");
      setAlias("");
    }
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="input-row">
        <input
          type="text"
          inputMode="url"
          className="input"
          placeholder="https://example.com/a/very/long/link"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-label="Long URL"
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !url.trim()}>
          {loading ? (
            <>
              <span className="spinner" /> Shortening…
            </>
          ) : (
            "Shorten URL"
          )}
        </button>
      </div>

      <button type="button" className="link-btn" onClick={() => setShowAlias(!showAlias)}>
        {showAlias ? "− Hide custom alias" : "+ Add a custom alias (optional)"}
      </button>

      {showAlias && (
        <div className="alias-row">
          <span className="alias-prefix">short link /</span>
          <input
            type="text"
            className="input"
            placeholder="my-link"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            aria-label="Custom alias"
            maxLength={30}
            disabled={loading}
          />
        </div>
      )}
    </form>
  );
}
