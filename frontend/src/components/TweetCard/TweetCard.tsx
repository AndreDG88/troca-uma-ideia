import { useState } from "react";
import type { Tweet } from "../../types/UserProfile";
import { useNavigate } from "react-router-dom";

interface Props {
  tweet: Tweet;
  onLiked?: () => void;
}

export default function TweetCard({ tweet, onLiked }: Props) {
  const navigate = useNavigate();
  const [likes, setLikes] = useState(tweet.likes);
  const [likedByUser, setLikedByUser] = useState(tweet.liked_by_user);

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`https://AndreDG88.pythonanywhere.com/api/tweets/${tweet.id}/like/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setLikes((prev) => (likedByUser ? prev - 1 : prev + 1));
        setLikedByUser((prev) => !prev);
        if (onLiked) onLiked();
      } else {
        console.error("Erro ao curtir/descurtir o tweet");
      }
    } catch (error) {
      console.error("Erro de rede ao curtir/descurtir:", error);
    }
  };

  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "16px",
        borderBottom: "1px solid #ccc",
        paddingBottom: "12px",
      }}
    >
      {tweet.user.profile.avatar && (
        <img
          src={tweet.user.profile.avatar}
          alt={`Avatar de ${tweet.user.username}`}
          style={{ width: "40px", height: "40px", borderRadius: "50%" }}
        />
      )}
      <div>
        <p><strong>@{tweet.user.username}</strong></p>
        <p>{tweet.content}</p>
        <p style={{ fontSize: "0.85em", color: "#555" }}>
          {new Date(tweet.created_at).toLocaleString()}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{likes} ❤️</span>
          <button onClick={handleLike}>
            {likedByUser ? "Descurtir" : "Curtir"}
          </button>
        </div>
      </div>
    </li>
  );
}
