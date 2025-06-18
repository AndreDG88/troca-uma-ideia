import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import styles from "./Register.module.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== passwordConfirm) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      await api.post("/api/register/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Usuário criado com sucesso! Você será redirecionado para o login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Erro ao criar usuário: " + err.message);
      } else {
        setError("Erro ao criar usuário.");
      }
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
              Para criar sua conta no <strong>Troca uma ideia!</strong>, preencha
              corretamente seus dados. Capriche no nome de usuário e escolha um avatar legal!
              <br />
              <strong>OBS:</strong> Escolha uma imagem leve.
            </p>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.title}>Cadastro</h2>

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Usuário */}
              <div className={styles.formGroup}>
                <label htmlFor="username">Usuário</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                />
              </div>

              {/* Email */}
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Senha */}
              <div className={styles.formGroup}>
                <label htmlFor="password">Senha</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {/* Confirmação de Senha */}
              <div className={styles.formGroup}>
                <label htmlFor="passwordConfirm">Confirme a Senha</label>
                <input
                  type="password"
                  id="passwordConfirm"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              {/* Upload de Avatar */}
              <div className={styles.formGroup}>
                <label htmlFor="avatar">Avatar (opcional)</label>
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              {/* Botão de submit */}
              <button type="submit" className={styles.button}>
                Cadastrar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;