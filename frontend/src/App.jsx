import { useEffect, useState } from "react";
import { createUrl, getUrls, deleteUrl } from "./api.js";
import UrlForm from "./components/UrlForm.jsx";
import ResultCard from "./components/ResultCard.jsx";
import Stats from "./components/Stats.jsx";
import UrlTable from "./components/UrlTable.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  const [urls, setUrls] = useState([]);
  const [result, setResult] = useState(null); // the most recently created link
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listLoading, setListLoading] = useState(true);

  // Load history when the page opens
  useEffect(() => {
    loadUrls();
  }, []);

  async function loadUrls() {
    try {
      setUrls(await getUrls());
    } catch (err) {
      setError(err.message);
    } finally {
      setListLoading(false);
    }
  }

  async function handleCreate(originalUrl, customAlias) {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const created = await createUrl(originalUrl, customAlias);
      setResult(created);
      setUrls((prev) => [created, ...prev]);
      return true; // tells the form it can clear itself
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this short link? It will stop working.")) return;
    try {
      await deleteUrl(id);
      setUrls((prev) => prev.filter((u) => u.id !== id));
      if (result && result.id === id) setResult(null);
    } catch (err) {
      setError(err.message);
    }
  }

  const totalClicks = urls.reduce((sum, u) => sum + u.clicks, 0);

  return (
    <div className="app">
      <header className="navbar">
        <div className="container nav-inner">
          <span className="logo">🔗 VM - URL shortener </span>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <h1>
              Make long links <span className="gradient-text">short & sweet</span>
            </h1>
            <p className="subtitle">
              Paste a long URL, get a clean short link you can share anywhere — and see how many people click it.
            </p>

            <UrlForm onSubmit={handleCreate} loading={loading} />

            {error && (
              <div className="alert alert-error" role="alert">
                {error}
              </div>
            )}
            {result && <ResultCard result={result} />}
          </div>
        </section>

        <section className="container dashboard">
          <Stats totalLinks={urls.length} totalClicks={totalClicks} />
          <UrlTable urls={urls} loading={listLoading} onDelete={handleDelete} onRefresh={loadUrls} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
