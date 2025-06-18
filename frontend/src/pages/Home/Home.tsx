import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import type { Tweet } from "../../types/UserProfile";
import api from "../../api/axios";
import SendPapo from "../SendPapo/SendPapo";
import TweetCard from "../../components/TweetCard/TweetCard";
import styles from "./Home.module.css";

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estados
  const [userPapos, setUserPapos] = useState<Tweet[]>([]);
  const [timelinePapos, setTimelinePapos] = useState<Tweet[]>([]);
  const [view, setView] = useState<"feed" | "sendPapo" | "timeline">("feed");

  // Funções auxiliares 
  const apenasOriginais = (tweets: Tweet[]) =>
    tweets.filter((t) => !t.reply_to && !t.is_repapo);

  const apenasNaoComentarios = (tweets: Tweet[]) =>
    tweets.filter((t) => !t.reply_to);

  const fetchUserPapos = useCallback(async () => {
    try {
      const response = await api.get("/api/mytweets/");
      setUserPapos(apenasOriginais(response.data.slice(0, 10)));
    } catch (error) {
      console.error("Erro ao buscar papos do usuário:", error);
    }
  }, []);

  useEffect(() => {
    fetchUserPapos();
  }, [fetchUserPapos]);


  const fetchTimelinePapos = async () => {
    try {
      const response = await api.get("/api/timeline/");
      setTimelinePapos(apenasNaoComentarios(response.data));
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

  if (!user) {
    return <p>Carregando dados do usuário...</p>;
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.containerHome}>

        {/* Botões de navegação interna */}
        <div className={styles.navMenu}>
          
          {view === "feed" && (
            <>
              <button
                className={styles.navButton}
                onClick={() => setView("sendPapo")}
              >
                Mandar um papo
              </button>
              <button
                className={styles.navButton}
                onClick={() => {
                  setView("timeline");
                  fetchTimelinePapos();
                }}
              >
                Trocas de ideias
              </button>
              <button
                className={styles.navButton}
                onClick={() => navigate("/profile")}
              >
                Meu Perfil
              </button>
              <button
                className={styles.logoutButton}
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Sair
              </button>
            </>
          )}

          {(view === "sendPapo" || view === "timeline") && (
            <>
              <button 
                className={styles.navButton}
                onClick={() => setView("feed")}
              >
                Voltar para meus papos
              </button>

              {view === "sendPapo" && (
                <button 
                  className={styles.navButton}
                  onClick={() => {
                    setView("timeline");
                    fetchTimelinePapos();
                  }}
                >
                  Trocas de ideias
                </button>
              )}

              {view === "timeline" && (
                <button 
                  className={styles.navButton}
                  onClick={() => setView("sendPapo")}
                >
                  Mandar um papo
                </button>
              )}
            </>
          )}
      </div>

      {/* ÁREA DE CONTEÚDO VARIÁVEL */}
      <div className="mt-4">
        {view === "feed" && (
          <>
            <h2 className={styles.title}>Seus últimos 10 papos:</h2>
            {userPapos.length > 0 ? (
              <ul className="list-group mt-3">
                {userPapos.map((papo) => (
                  <TweetCard key={papo.id} tweet={papo} onLiked={fetchUserPapos}/>
                ))}
              </ul>
            ) : (
              <p className="mt-3">Você ainda não mandou nenhum papo!.</p>
            )}
          </>
        )}

        {view === "timeline" && (
          <>
            <h2 className={styles.title}>Sua Timeline</h2>
            {timelinePapos.length > 0 ? (
              <ul className="list-group mt-3">
                {timelinePapos.map((papo) => (
                  <TweetCard key={papo.id} tweet={papo} onLiked={fetchTimelinePapos}/>
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
  </div>
);
};

export default Home;