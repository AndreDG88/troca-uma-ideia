import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import styles from "./Login.module.css"

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
    <div className={styles.backgroundWrapper}>
      <video autoPlay loop muted className={styles.videoBackground}>
        <source src="/media/background-login.mp4" type="video/mp4" />
        Seu navegador não suporta vídeos em HTML5.
      </video>

      <div className={styles.contentWrapper}>
        <div className={styles.contentInner}>
          <div className={styles.infoSection}>
            <img
              src="/media/troca-uma-ideia_logo.png"
              alt="Logo Troca uma ideia!"
              className={styles.logo}
            />
            <p className={styles.infoText}>
              Bem-vindo ao <strong>Troca uma ideia!</strong> — a rede social para
              compartilhar pensamentos, conectar ideias e construir conversas.
            </p>
          </div>
        
        <div className={styles.formSection}>
          <h2 className={styles.title}>Login</h2>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="username">Usuário</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Senha</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className={styles.button}>
                Entrar
              </button>
            </form>

            <p className={styles.registerText}>
              Não tem uma conta?{" "}
              <Link to="/register" className={styles.registerLink}>
                Cadastre-se aqui
              </Link>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Login;
