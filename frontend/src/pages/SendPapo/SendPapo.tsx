import { useState } from "react";
import api from "../../api/axios";

interface SendPapoProps {
  onPapoSent: () => void;
}

const SendPapo = ({ onPapoSent }: SendPapoProps) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("O papo não pode ser vazio.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/tweets/", { content });
      setContent("");
      onPapoSent();
    } catch (err: unknown) {
      if (err instanceof Error) setError(`Erro ao mandar papo: ${err.message}`);
      else setError("Erro desconhecido ao mandar papo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="mb-3">
        <label htmlFor="content" className="form-label">
          Manda o teu papo!:
        </label>
        <textarea
          id="content"
          className="form-control"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          disabled={loading}
          maxLength={280}
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" className="btn btn-success" disabled={loading}>
        {loading ? "Enviando..." : "Mandar papo"}
      </button>
    </form>
  );
};

export default SendPapo;
