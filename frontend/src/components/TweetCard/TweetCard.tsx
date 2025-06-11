import { useEffect, useState } from "react";
import api from "../../api/axios";
import type { Tweet } from "../../types/UserProfile";

interface TweetCardProps {
  tweet: Tweet;
  onLiked?: () => void;
}

const TweetCard = ({ tweet, onLiked }: TweetCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(tweet.likes_count || 0);

  useEffect(() => {
    if ("liked" in tweet) {
      setLiked(Boolean(tweet.liked));
    }
  }, [tweet]);

  // Função para toggle like
  const handleLikeToggle = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para curtir.");
      return;
    }

    try {
      let response;
      if (liked) {
        // Se já curtiu, descurte
        response = await api.delete(`/api/tweets/${tweet.id}/like/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Se não curtiu, curta
        response = await api.post(`/api/tweets/${tweet.id}/like/`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const data = response.data;
      setLiked(data.liked);
      setLikesCount(data.likes_count);

      if (onLiked) onLiked();
    } catch (error) {
      console.error("Erro ao curtir/descurtir papo:", error);
    }
  };

  // Montar URL completa do avatar
  const avatarUrl = tweet.user?.profile?.avatar
    ? `https://AndreDG88.pythonanywhere.com${tweet.user.profile.avatar}`
    : "/default-avatar.png";

  return (
    <li className="tweet-card border rounded p-3 mb-3">
      <div className="d-flex align-items-center mb-2">
        <img
          src={avatarUrl}
          alt={`${tweet.user?.username}'s avatar`}
          style={{ width: 40, height: 40, borderRadius: "50%", marginRight: 10 }}
        />
        <strong>{tweet.user?.username || "Usuário"}</strong>
      </div>
      <p>{tweet.content}</p>

      <button
        type="button"
        className={`btn btn-sm ${liked ? "btn-danger" : "btn-outline-danger"}`}
        onClick={handleLikeToggle}
      >
        {liked ? "❤️ Curtido" : "♡ Curtir"} ({likesCount})
      </button>
    </li>
  );
};

export default TweetCard;

