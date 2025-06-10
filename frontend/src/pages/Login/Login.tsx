import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const Login = () => {
  const { login } = useAuth(); // Pega a função login do contexto
  const [username, setUsername] = useState(""); // Estado do nome de usuário
  const [password, setPassword] = useState(""); // Estado da senha
  const [error, setError] = useState(""); // Mensagem de erro

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita o reload da página

    try {
      await login(username, password); // Tenta logar com os dados
    } catch (err) {
  console.error(err); // exibe o erro no console do navegador
  setError("Usuário ou senha inválidos.");
}
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>

      <div className="text-center mb-4">
        {/* Substir o src pela sua logo depois */}
        <img
          src="/logo-placeholder.png"
          alt="Logo Troca uma ideia!"
          style={{ width: "120px", marginBottom: "1rem" }}
        />
      </div>

      <p className="text-center mb-4">
        Bem-vindo ao <strong>Troca uma ideia!</strong> — a rede social para compartilhar seus pensamentos e trocar ideias.
      </p>

      <h2 className="mb-4 text-center">Login</h2>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Usuário
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Senha
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Entrar
        </button>
      </form>

      <p className="text-center mt-3">
        Não tem uma conta?{" "}
        <Link to="/register" style={{ textDecoration: "underline" }}>
          Cadastre-se aqui
        </Link>
      </p>
    </div>
  );
};

export default Login;
