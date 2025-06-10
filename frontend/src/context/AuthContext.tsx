import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import type { UserProfile } from "../types/UserProfile";

// Tipagem do contexto (token, usuário e funções de login/logout)
interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

// Criação do contexto de autenticação
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  // Pega token do localStorage (se já estiver salvo)
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("accessToken");
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Cria a função logout
  const logout = useCallback(() => {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    navigate("/login");
  }, [navigate]);

    // Tenta renovar o token de acesso usando o refresh token
  const refreshToken = useCallback(async () => {
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) return logout();

    try {
      const res = await api.post("/api/token/refresh/", { refresh });
      const newAccess = res.data.access;
      setToken(newAccess);
      localStorage.setItem("accessToken", newAccess);
      api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
    } catch {
      logout();
    }
  }, [logout]);

  // Sempre que o token muda, tenta buscar o perfil autenticado
  useEffect(() => {
  const initializeAuth = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/api/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } catch {
      await refreshToken();
    } finally {
      setLoading(false);
    }
  };

  initializeAuth();
}, [token, refreshToken]);

// Cria a função login
  const login = async (username: string, password: string) => {
    const response = await api.post("/api/token/", {
      username,
      password,
    });

    const { access, refresh } = response.data;
    setToken(access);
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    // Define o token como header padrão do axios
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Busca o perfil autenticado
    const profile = await api.get("/api/profile/");
    setUser(profile.data);
    // Redireciona para a página inicial
    navigate("/");
  };

  // Disponibiliza os dados e funções para os componentes filhos
  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto facilmente
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
