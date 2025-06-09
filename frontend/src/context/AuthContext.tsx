import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import type { UserProfile } from "../types/UserProfile";

// Tipagem do contexto (token, usuário e funções de login/logout)
interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
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
    return localStorage.getItem("token");
  });

  const navigate = useNavigate();

  // Cria a função logout
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    navigate("/login");
  }, [navigate]);


  // Sempre que o token muda, tenta buscar o perfil autenticado
  useEffect(() => {
    if (token) {
      api
        .get("/api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data);
          // Atualiza o header do axios globalmente
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        })
        .catch(() => logout()); // Token inválido? Desloga
    }
  }, [token, logout]);

// Cria a função login
  const login = async (username: string, password: string) => {
    const response = await api.post("/api/token/", {
      username,
      password,
    });

    const token = response.data.access;
    setToken(token);
    localStorage.setItem("token", token);
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
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto facilmente
export const useAuth = () => useContext(AuthContext);
