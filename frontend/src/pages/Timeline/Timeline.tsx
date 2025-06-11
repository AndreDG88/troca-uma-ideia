import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Tweet } from "../../types/UserProfile";
import TweetCard from "../../components/TweetCard/TweetCard";
import api from "../../api/axios";

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
      const response = await api.get("/api/timeline/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTweets(response.data);
    } catch (error) {
      console.error("Erro ao carregar a timeline", error);
    }
  }, [navigate]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return (
    <div>
      <h2>Timeline</h2>
      <ul className="list-unstyled">
        {tweets.map((tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} onLiked={fetchTimeline} />
        ))}
      </ul>
    </div>
  );
}
