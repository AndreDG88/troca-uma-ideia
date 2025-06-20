import { useEffect, useState } from "react";

type Trend = {
  hashtag: string;
  count: number;
};

export default function Trends() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await fetch("https://andredg88.pythonanywhere.com/api/trends/");
        const data = await response.json();
        if (Array.isArray(data)) {
          setTrends(data);
        } else if (data.message) {
          setErro(data.message);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErro(error.message);
        } else {
          setErro("Erro ao buscar trends.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrends();
  }, []);

  if (loading) return <p>Carregando...</p>;
  if (erro) return <p>{erro}</p>;

  return (
    <div>
      <h3>🔥 Papo em Alta</h3>
      <ul>
        {trends.map((trend, index) => (
          <li key={index}>
            <strong>{trend.hashtag}</strong> – {trend.count} Papos
          </li>
        ))}
      </ul>
    </div>
  );
}
