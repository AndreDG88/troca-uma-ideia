import { useState } from "react";
import api from "../../api/axios";

interface TweetFormProps {
  onTweetPosted: () => void;
}

const TweetForm = ({ onTweetPosted }: TweetFormProps) => {
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await api.post("/api/tweets/", { content });
      setContent("");
      onTweetPosted();
    } catch (err) {
      console.error("Erro ao enviar tweet:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="O que você está pensando?"
        rows={3}
      />
      <button type="submit">Tweetar</button>
    </form>
  );
};

export default TweetForm;
