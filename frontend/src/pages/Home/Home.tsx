import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import api from "../../api/axios";

const Home = () => {
  const { user, logout, setUser } = useAuth(); // vou explicar como adicionar setUser no contexto!
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const response = await api.patch("/api/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Resposta do upload:", response.data);

      const profileResponse = await api.get("/api/profile/");
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
    </div>
  );
};

export default Home;

