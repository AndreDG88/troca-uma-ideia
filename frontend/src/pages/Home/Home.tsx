import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../../api/axios";

const Home = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Armazena tweets do usuário
  const [userTweets, setUserTweets] = useState<
    Array<{ id: number; content: string; created_at: string }>
  >([]);

  useEffect(() => {
    const fetchUserTweets = async () => {
      try {
        const response = await api.get("/api/mytweets/");
        setUserTweets(response.data);
      } catch (error) {
        console.error("Erro ao buscar tweets do usuário:", error);
      }
    };

    fetchUserTweets();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleChangeAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;
    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("avatar", event.target.files[0]);

    try {
      const response = await api.patch("/api/myprofile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Resposta do upload:", response.data);

      const profileResponse = await api.get("/api/myprofile/");
      setUser(profileResponse.data);

    } catch (err: unknown) {
        if (err instanceof Error) {
          setError(`Erro ao fazer upload do avatar: ${err.message}`);
        } else {
          setError("Erro ao fazer upload do avatar.");
      }
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return <p>Carregando dados do usuário...</p>;
  }

  return (
    <div className="container mt-5 text-center">
      <h1>Bem-vindo, {user?.username ? user.username : "usuário"}!</h1>

      {user?.profile?.avatar && (
        <div className="my-4">
          <img
            src={`${user.profile.avatar}?t=${new Date().getTime()}`}
            alt="Avatar do usuário"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #ccc",
            }}
          />
        </div>
      )}

      <button
        className="btn btn-outline-primary mb-3"
        onClick={handleChangeAvatarClick}
        disabled={uploading}
      >
        {uploading ? "Carregando..." : "Alterar Avatar"}
      </button>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept="image/*"
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="d-grid gap-3 mt-4">
        <button className="btn btn-primary" onClick={() => navigate("/timeline")}>
          Ver Timeline
        </button>
        <button className="btn btn-success" onClick={() => navigate("/novo-tweet")}>
          Criar Novo Tweet
        </button>
        <button className="btn btn-secondary" onClick={() => navigate("/perfil")}>
          Meu Perfil
        </button>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Sair
        </button>
      </div>

      <div className="mt-5 text-start">
        <h3>Quer conferir suas últimas ideias?</h3>

        {userTweets.length > 0 ? (
          <ul className="list-group mt-3">
            {userTweets.map((tweet) => (
              <li key={tweet.id} className="list-group-item">
                <p>{tweet.content}</p>
                <small className="text-muted">
                  {new Date(tweet.created_at).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3">Você ainda não postou nenhuma ideia.</p>
        )}
      </div>
    </div>
  );
};

export default Home;

