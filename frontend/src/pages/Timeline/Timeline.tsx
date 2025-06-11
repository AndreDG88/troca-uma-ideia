import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Tweet } from "../../types/UserProfile";
import TweetCard from "../../components/TweetCard/TweetCard";

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
      const response = await fetch("https://AndreDG88.pythonanywhere.com/api/timeline/", {
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
          <TweetCard key={tweet.id} tweet={tweet} onLiked={fetchTimeline} />
        ))}
      </ul>
    </div>
  );
}
