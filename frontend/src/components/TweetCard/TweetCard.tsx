import { useEffect, useState } from "react";
import api from "../../api/axios";
import type { Tweet } from "../../types/UserProfile";
import { useAuth } from "../../context/AuthContext";

interface TweetCardProps {
  tweet: Tweet;
  onLiked?: () => void;
}

const TweetCard = ({ tweet, onLiked }: TweetCardProps) => {
  const [likesCount, setLikesCount] = useState(tweet.likes_count || 0);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth(); // Usa o token diretamente do AuthContext

  useEffect(() => {
    setLikesCount(tweet.likes_count || 0);
  }, [tweet]);

  // Alterna entre curtir e descurtir o tweet
  const handleLikeToggle = async () => {
    if (!token || loading) return;
    // console.log("Token atual:", token); // Para depuração

    setLoading(true);
    try {
      const response = tweet.liked
        // Descurtir
        ? await api.delete(`/api/tweets/${tweet.id}/like/`, {
          headers: { Authorization: `Bearer ${token}` },
          })
        // Curtir
        : await api.post(`/api/tweets/${tweet.id}/like/`, null, {
          headers: { Authorization: `Bearer ${token}` },
          });

      // Garante que os dados estão atualizados corretamente
      const data = response.data;

      if (typeof data.likes_count !== "undefined") {
        setLikesCount(data.likes_count);
      } else {
        setLikesCount((prev) => 
          tweet.liked ? prev - 1 : prev + 1
        );
      }

      if (onLiked) onLiked();
    } catch (error) {
      console.error("Erro ao curtir/descurtir papo:", error);
    } finally {
      setLoading(false);
    }
  };

  // Montar URL completa do avatar
  const avatarUrl = tweet.user?.profile?.avatar
    ? tweet.user.profile.avatar.startsWith("http")
      ? tweet.user.profile.avatar
      : `https://AndreDG88.pythonanywhere.com${tweet.user.profile.avatar}`
    : "/default-avatar.png";

  return (
    <li className="tweet-card border rounded p-3 mb-3">
      {/* Header com avatar e nome do usuário */}
      <div className="d-flex align-items-center mb-2">
        <img
          src={avatarUrl}
          alt={`${tweet.user?.username}'s avatar`}
          style={{ width: 40, height: 40, borderRadius: "50%", marginRight: 10 }}
        />
        <strong>{tweet.user?.username || "Usuário"}</strong>
      </div>

      {/* Conteúdo do tweet */}
      <p>{tweet.content}</p>

      {/* Botão de curtir/descurtir */}
      <button
        type="button"
        onClick={handleLikeToggle}
        disabled={loading}
        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
      >
        <span style={{ fontSize: "1.2rem", color: "#dc3545" }}>❤️</span>
        <span>Curtir</span>
        <span> {likesCount}</span>
      </button>
    </li>
  );
};

export default TweetCard;

