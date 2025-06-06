import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { JSX } from "react";

// Esse componente será usado para proteger rotas específicas.
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useAuth();

  // Se não houver token, redireciona para login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Caso contrário, renderiza o componente protegido
  return children;
};

export default PrivateRoute;
