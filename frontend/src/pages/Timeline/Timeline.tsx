import { useEffect, useCallback, useState } from "react";
import type { Tweet } from "../../types/UserProfile";
import { useNavigate } from "react-router-dom";

export default function Timeline() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const navigate = useNavigate();

  const fetchTimeline = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("https://<SEU_BACKEND>/api/timeline/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: Tweet[] = await response.json();
        setTweets(data);
      } else {
        console.error("Erro ao carregar a timeline");
      }
    } catch (error) {
      console.error("Erro de rede:", error);
    }
  }, [navigate]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return (
    <div>
      <h2>Timeline</h2>
      <ul>
        {tweets.map((tweet) => (
          <li key={tweet.id} style={{ borderBottom: "1px solid #ccc", padding: "10px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {tweet.user.profile?.avatar && (
                <img
                  src={tweet.user.profile.avatar}
                  alt="Avatar"
                  style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                />
              )}
              <strong>@{tweet.user.username}</strong>
            </div>
            <p>{tweet.content}</p>
            <p>{new Date(tweet.created_at).toLocaleString()}</p>
            <p>{tweet.likes} ❤️</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
