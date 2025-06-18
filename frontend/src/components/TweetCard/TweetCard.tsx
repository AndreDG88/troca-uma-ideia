import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import type { Tweet } from "../../types/UserProfile";
import { useAuth } from "../../context/AuthContext";
import styles from "./TweetCard.module.css";

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
    <li className={styles.tweetCard}>
      {/* Header com avatar e nome do usuário */}
      <div className={styles.header}>
        <Link to={`/profile/${tweet.user?.username}`} className={styles.username}>
          <img
            src={avatarUrl}
            alt={`${tweet.user?.username}'s avatar`}
            className={styles.avatar}
          />
          @{tweet.user?.username || "Usuário"}
        </Link>
      </div>

      {/* SE FOR REPAPO: Exibe conteúdo original */}
      {tweet.is_repapo && tweet.original_tweet && (
        <div className={styles.repapoBox}>
          🔁 RePapearam este papo:<br />
          <strong>@{tweet.original_tweet.user?.username}</strong>: {tweet.original_tweet.content}
        </div>
      )}
      
      {/* Conteúdo do tweet */}
      <p className={styles.content}>{tweet.content}</p>

      {/* Botões: Curtir / Comentar / Repapo */}
      <div className={styles.actions}>
        <button
          onClick={handleLikeToggle}
          disabled={loading}
          className={styles.button}
        >
          ❤️ {likesCount}
        </button>

        <button
          onClick={() => setCommentBoxVisible((prev) => !prev)}
          className={styles.button}
        >
          💬 Comentar
        </button>

        <button
          onClick={handleRepapo}
          className={styles.button}
        >
          🔁 RePapear ({repapearCount})
        </button>

        {tweet.user?.id === user?.id && (
          <button
            onClick={handleDeleteTweet}
            className={`${styles.button} ${styles.danger}`}
          >
            🗑️ Excluir
          </button>
        )}
      </div>

      {/* Caixa de comentário */}
      {commentBoxVisible && (
        <div className={styles.commentBox}>
          <textarea
            placeholder="Escreva um comentário..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
          />
          <button onClick={handleCommentSubmit} className={styles.button}>
            Enviar
          </button>
        </div>
      )}

      {/* Renderizar replies */}
      {tweet.replies && tweet.replies.length > 0 && (
        <ul className={styles.replies}>
          {tweet.replies.map((reply) => (
            <TweetCard key={reply.id} tweet={reply} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default TweetCard;

