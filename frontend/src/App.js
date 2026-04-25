import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ModeToggle({ mode, onChange }) {
  return (
    <div className="toggle-group">
      <span className="toggle-label">Mode</span>
      <div className="toggle-track">
        <button
          className={`toggle-btn ${mode === "junior" ? "active" : ""}`}
          onClick={() => onChange("junior")}
        >
          <span className="toggle-icon">◈</span> Junior
        </button>
        <button
          className={`toggle-btn ${mode === "senior" ? "active" : ""}`}
          onClick={() => onChange("senior")}
        >
          <span className="toggle-icon">◆</span> Senior
        </button>
      </div>
    </div>
  );
}

function ScaleSelector({ scale, onChange }) {
  const options = [
    { value: "startup", label: "Startup", sub: "< 10K users" },
    { value: "medium", label: "Medium", sub: "10K–100K" },
    { value: "large", label: "Large Scale", sub: "1M+ users" },
  ];

  return (
    <div className="scale-group">
      <span className="toggle-label">Scale</span>
      <div className="scale-options">
        {options.map((opt) => (
          <button
            key={opt.value}
            className={`scale-btn ${scale === opt.value ? "active" : ""}`}
            onClick={() => onChange(opt.value)}
          >
            <span className="scale-name">{opt.label}</span>
            <span className="scale-sub">{opt.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FollowUpChips({ text, onSelect }) {
  const matches = text.match(/\d\.\s(.+)/g);
  if (!matches || matches.length < 2) return null;

  const chips = matches.slice(0, 3).map((m) => m.replace(/^\d\.\s/, "").trim());

  return (
    <div className="followup-chips">
      <span className="followup-label">Quick follow-ups →</span>
      <div className="chips-row">
        {chips.map((chip, i) => (
          <button key={i} className="chip" onClick={() => onSelect(chip)}>
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

function OutputPanel({ result, loading, onFollowUp }) {
  if (loading) {
    return (
      <div className="output-panel loading-state">
        <div className="loader-ring"></div>
        <p className="loading-text">Thinking like a senior engineer...</p>
        <p className="loading-sub">Analyzing trade-offs, failure modes, architecture...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="output-panel empty-state">
        <div className="empty-icon">⬡</div>
        <p className="empty-title">No response yet</p>
        <p className="empty-sub">Ask an engineering question above to get started.</p>
        <div className="example-chips">
          {[
            "Design a URL shortener at scale",
            "How would you build a chat system?",
            "Critique my polling-based notification system",
          ].map((ex, i) => (
            <button key={i} className="example-chip" onClick={() => onFollowUp(ex)}>
              {ex}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="output-panel has-content">
      <div className="output-header">
        <span className="output-badge">Response</span>
        <button
          className="copy-btn"
          onClick={() => navigator.clipboard.writeText(result)}
          title="Copy to clipboard"
        >
          ⎘ Copy
        </button>
      </div>
      <div className="markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
      </div>
      <FollowUpChips text={result} onSelect={onFollowUp} />
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("senior");
  const [scale, setScale] = useState("startup");
  const [userArchitecture, setUserArchitecture] = useState("");
  const [showCritique, setShowCritique] = useState(false);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const outputRef = useRef(null);

  useEffect(() => {
    if (result && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const handleSubmit = async (overrideQuery) => {
    const q = overrideQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setResult("");
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          mode,
          scale,
          userArchitecture: showCritique ? userArchitecture : "",
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Server error");

      setResult(data.result);
      setHistory((prev) => [
        { query: q, mode, scale, result: data.result, ts: Date.now() },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = (q) => {
    setQuery(q);
    handleSubmit(q);
  };

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-icon">◆</span>
            <span className="brand-name">SeniorMind</span>
            <span className="brand-tag">AI</span>
          </div>
          <p className="brand-desc">
            Staff Engineer Simulator · Think in systems, not solutions
          </p>
        </div>
      </header>

      <main className="app-main">
        <div className="content-grid">
          {/* ── Left Panel: Controls ── */}
          <aside className="left-panel">
            <div className="controls-card">
              <ModeToggle mode={mode} onChange={setMode} />
              <div className="divider" />
              <ScaleSelector scale={scale} onChange={setScale} />
              <div className="divider" />

              {/* Critique Toggle */}
              <div className="critique-toggle">
                <button
                  className={`critique-btn ${showCritique ? "active" : ""}`}
                  onClick={() => setShowCritique((v) => !v)}
                >
                  <span className="critique-icon">⚠</span>
                  Architecture Critic
                  <span className={`toggle-arrow ${showCritique ? "open" : ""}`}>▾</span>
                </button>
                {showCritique && (
                  <textarea
                    className="critique-input"
                    placeholder="Paste your architecture design here...&#10;&#10;e.g. Client → Monolith → Single MySQL DB&#10;Cron job polls DB every 5s for notifications"
                    value={userArchitecture}
                    onChange={(e) => setUserArchitecture(e.target.value)}
                    rows={6}
                  />
                )}
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="history-card">
                <p className="history-title">Recent</p>
                {history.map((h, i) => (
                  <button
                    key={h.ts}
                    className="history-item"
                    onClick={() => {
                      setQuery(h.query);
                      setMode(h.mode);
                      setScale(h.scale);
                      setResult(h.result);
                    }}
                  >
                    <span className="history-q">{h.query.slice(0, 42)}{h.query.length > 42 ? "…" : ""}</span>
                    <span className="history-meta">{h.mode} · {h.scale}</span>
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* ── Right Panel: Input + Output ── */}
          <div className="right-panel">
            {/* Query Input */}
            <div className="input-card">
              <div className="input-header">
                <span className="input-label">Engineering Query</span>
                <span className="input-hint">
                  {mode === "senior" ? "◆ Senior Mode" : "◈ Junior Mode"} ·{" "}
                  {scale === "startup" ? "Startup" : scale === "medium" ? "Medium Scale" : "Large Scale (1M+)"}
                </span>
              </div>
              <textarea
                className="query-input"
                placeholder={
                  showCritique
                    ? "Describe what your architecture is trying to solve..."
                    : "e.g. Design a real-time notification system\nor: How should I handle database migrations at scale?"
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
                }}
                rows={4}
              />
              {error && <div className="error-banner">⚠ {error}</div>}
              <div className="input-footer">
                <span className="input-tip">⌘↵ to submit</span>
                <button
                  className="submit-btn"
                  onClick={() => handleSubmit()}
                  disabled={loading || !query.trim()}
                >
                  {loading ? (
                    <span className="btn-loading">
                      <span className="spinner"></span> Analyzing...
                    </span>
                  ) : (
                    <>{showCritique ? "⚠ Critique Architecture" : "◆ Analyze"}</>
                  )}
                </button>
              </div>
            </div>

            {/* Output */}
            <div ref={outputRef}>
              <OutputPanel result={result} loading={loading} onFollowUp={handleFollowUp} />
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <span>SeniorMind AI · Built with Gemini 1.5 Flash · Think in systems</span>
      </footer>
    </div>
  );
}