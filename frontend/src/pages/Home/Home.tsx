import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import SendPapo from "../SendPapo/SendPapo";

const Home = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para armazenar os papos do usuário
  const [userPapos, setUserPapos] = useState<
    Array<{ id: number; content: string; created_at: string }>
  >([]);

  // Estado para controlar se está exibindo o feed ou o formulário mandar papo
  const [view, setView] = useState<"feed" | "sendPapo">("feed");

  useEffect(() => {
    const fetchUserPapos = async () => {
      try {
        const response = await api.get("/api/mytweets/"); // Pode renomear endpoint depois se quiser
        setUserPapos(response.data);
      } catch (error) {
        console.error("Erro ao buscar papos do usuário:", error);
      }
    };

    fetchUserPapos();
  }, []);

  // Função para atualizar lista de papos após enviar um novo
  const refreshPapos = async () => {
    try {
      const response = await api.get("/api/mytweets/");
      setUserPapos(response.data);
    } catch (error) {
      console.error("Erro ao buscar papos do usuário:", error);
    }
  };

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

      {/* Botões para alternar entre views */}
      <div className="d-grid gap-3 mt-4">
        {view === "feed" && (
          <>
            <button
              className="btn btn-success"
              onClick={() => setView("sendPapo")}
            >
              Mandar um papo
            </button>
            <button className="btn btn-primary" onClick={() => navigate("/timeline")}>
              Ver Timeline
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/perfil")}>
              Meu Perfil
            </button>
          </>
        )}

        {view === "sendPapo" && (
          <button className="btn btn-outline-secondary" onClick={() => setView("feed")}>
            Voltar para meus papos
          </button>
        )}

        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Sair
        </button>
      </div>

      <div className="mt-5 text-start">
        {view === "feed" && (
          <>
            <h3>Quer conferir suas últimas trocações de ideia?</h3>

            {userPapos.length > 0 ? (
              <ul className="list-group mt-3">
                {userPapos.map((papo) => (
                  <li key={papo.id} className="list-group-item">
                    <p>{papo.content}</p>
                    <small className="text-muted">
                      {new Date(papo.created_at).toLocaleString()}
                    </small>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3">Você ainda não mandou nenhum papo!.</p>
            )}
          </>
        )}

        {view === "sendPapo" && (
          <SendPapo
            onPapoSent={() => {
              refreshPapos();
              setView("feed");
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Home;