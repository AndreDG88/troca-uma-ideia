import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { Tweet } from "../../types/UserProfile";
import api from "../../api/axios";
import SendPapo from "../SendPapo/SendPapo";

// ... (mantém os imports existentes)

const Home = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userPapos, setUserPapos] = useState<Tweet[]>([]);
  const [timelinePapos, setTimelinePapos] = useState<Tweet[]>([]);
  const [view, setView] = useState<"feed" | "sendPapo" | "timeline">("feed");

  useEffect(() => {
    fetchUserPapos();
  }, []);

  const fetchUserPapos = async () => {
    try {
      const response = await api.get("/api/mytweets/");
      setUserPapos(response.data.slice(0, 10)); // só os 10 mais recentes
    } catch (error) {
      console.error("Erro ao buscar papos do usuário:", error);
    }
  };

  const fetchTimelinePapos = async () => {
    try {
      const response = await api.get("/api/timeline/");
      setTimelinePapos(response.data);
    } catch (error) {
      console.error("Erro ao buscar timeline:", error);
    }
  };

  const refreshPapos = () => {
    fetchUserPapos();
    if (view === "timeline") {
      fetchTimelinePapos();
    }
  };

  const toggleLike = async (papoId: number, liked: boolean) => {
    try {
      if (liked) {
        await api.delete(`/api/tweets/${papoId}/like/`);
      } else {
        await api.post(`/api/tweets/${papoId}/like/`);
      }
      refreshPapos();
    } catch (error) {
      console.error("Erro ao curtir/descurtir:", error);
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
      await api.patch("/api/myprofile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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
        {view === "feed" && (
          <>
            <button className="btn btn-success" onClick={() => setView("sendPapo")}>
              Mandar um papo
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setView("timeline");
                fetchTimelinePapos();
              }}
            >
              Trocas de ideias
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/perfil")}>
              Meu Perfil
            </button>
          </>
        )}

        {(view === "sendPapo" || view === "timeline") && (
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
            <h3>Seus últimos 10 papos:</h3>
            {userPapos.length > 0 ? (
              <ul className="list-group mt-3">
                {userPapos.map((papo) => (
                  <li
                    key={papo.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <p>{papo.content}</p>
                      <small className="text-muted">
                        {new Date(papo.created_at).toLocaleString()}
                      </small>
                    </div>
                    <button
                      className={`btn btn-sm ${
                        papo.liked_by_user ? "btn-danger" : "btn-outline-danger"
                      }`}
                      onClick={() => toggleLike(papo.id, papo.liked_by_user)}
                    >
                      {papo.liked_by_user ? "💔 Descurtir" : "❤️ Curtir"} {papo.likes}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3">Você ainda não mandou nenhum papo!.</p>
            )}
          </>
        )}

        {view === "timeline" && (
          <>
            <h3>Sua Timeline</h3>
            {timelinePapos.length > 0 ? (
              <ul className="list-group mt-3">
                {timelinePapos.map((papo) => (
                  <li
                    key={papo.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{papo.user?.username || "@"}</strong>
                      <p>{papo.content}</p>
                      <small className="text-muted">
                        {new Date(papo.created_at).toLocaleString()}
                      </small>
                    </div>
                    <button
                      className={`btn btn-sm ${
                        papo.liked_by_user ? "btn-danger" : "btn-outline-danger"
                      }`}
                      onClick={() => toggleLike(papo.id, papo.liked_by_user)}
                    >
                      {papo.liked_by_user ? "💔" : "❤️"} {papo.likes}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3">Sua timeline está vazia.</p>
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
