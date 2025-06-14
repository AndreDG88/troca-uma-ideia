import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import type { Tweet } from "../../types/UserProfile";
import { useAuth } from "../../context/AuthContext";

interface TweetCardProps {
  tweet: Tweet;
  onLiked?: () => void;
  onCommented?: () => void;
  onRepapeared?: () => void;
}

const TweetCard = ({ tweet, onLiked, onCommented, onRepapeared }: TweetCardProps) => {
  const [likesCount, setLikesCount] = useState(tweet.likes_count || 0);
  const [loading, setLoading] = useState(false);
  const [repapearCount, setRepapearCount] = useState(tweet.repapear_count || 0);
  const [commentBoxVisible, setCommentBoxVisible] = useState(false);
  const [commentContent, setCommentContent] = useState("");

  const { token, user } = useAuth(); // Usa o token diretamente do AuthContext

  useEffect(() => {
    setLikesCount(tweet.likes_count || 0);
    setRepapearCount(tweet.repapear_count || 0);
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

  // Enviar comentário
  const handleCommentSubmit = async () => {
    if (!token || !commentContent.trim()) return;

    try {
      await api.post(
        `/api/tweets/`,
        {
          content: commentContent,
          reply_to_id: tweet.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCommentContent("");
      setCommentBoxVisible(false);
      onCommented?.();
    } catch (error) {
      console.error("Erro ao comentar:", error);
    }
  };

  // Fazer RePapo
  const handleRepapo = async () => {
    if (!token || loading) return;

    try {
      await api.post(
        `/api/tweets/`,
        {
          is_repapo: true,
          original_tweet_id: tweet.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRepapearCount((prev) => prev + 1);
      onRepapeared?.();
    } catch (error) {
      console.error("Erro ao repapear:", error);
    }
  };

  // Excluir papo
  const handleDeleteTweet = async () => {
    if (!token || loading) return;
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este papo?");
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await api.delete(`/api/tweets/${tweet.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onLiked?.(); // ou criar um onDeleted se preferir
    } catch (error) {
      console.error("Erro ao excluir o tweet:", error);
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
        <Link 
          to={`/profile/${tweet.user?.username}`} 
          className="d-flex align-items-center text-dark text-decoration-none"
          >
          <img
            src={avatarUrl}
            alt={`${tweet.user?.username}'s avatar`}
            style={{ width: 40, height: 40, borderRadius: "50%", marginRight: 10 }}
          />
        <strong>{tweet.user?.username || "Usuário"}</strong>
        </Link>
      </div>

      {/* SE FOR REPAPO: Exibe conteúdo original */}
      {tweet.is_repapo && tweet.original_tweet && (
        <div className="alert alert-light p-2 mb-2">
          <small className="text-muted">🔁 RePapearam este papo:</small>
          <p className="mb-0">
            <strong>@{tweet.original_tweet.user?.username}</strong>: {tweet.original_tweet.content}
          </p>
        </div>
      )}
      
      {/* Conteúdo do tweet */}
      <p>{tweet.content}</p>

      {/* Botões: Curtir / Comentar / Repapo */}
      <div className="d-flex gap-2 mt-2">
        <button
          type="button"
          onClick={handleLikeToggle}
          disabled={loading}
          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
        >
          <span style={{ fontSize: "1.2rem" }}>❤️</span>
          <span>{likesCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setCommentBoxVisible((prev) => !prev)}
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
        >
          💬 Comentar
        </button>

        <button
          type="button"
          onClick={handleRepapo}
          className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
        >
          🔁 RePapear ({repapearCount})
        </button>

        {tweet.user?.id === user?.id && (
          <button
            type="button"
            onClick={handleDeleteTweet}
            className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
          >
            🗑️ Excluir
          </button>
        )}
      </div>

      {/* Caixa de comentário */}
      {commentBoxVisible && (
        <div className="mt-2">
          <textarea
            className="form-control mb-2"
            placeholder="Escreva um comentário..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
          />
          <button onClick={handleCommentSubmit} className="btn btn-primary btn-sm">
            Enviar
          </button>
        </div>
      )}

      {/* Renderizar replies */}
      {tweet.replies && tweet.replies.length > 0 && (
        <ul className="mt-3 ps-3 border-start">
          {tweet.replies.map((reply) => (
            <TweetCard key={reply.id} tweet={reply} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default TweetCard;

