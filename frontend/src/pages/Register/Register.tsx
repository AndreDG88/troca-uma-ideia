import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const Register = () => {
  const [username, setUsername] = useState("");
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
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="mb-4 text-center">Cadastro</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Usuário */}
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Usuário</label>
          <input
            type="text"
            id="username"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
          />
        </div>

        {/* Senha */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Senha</label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {/* Confirmação de Senha */}
        <div className="mb-3">
          <label htmlFor="passwordConfirm" className="form-label">Confirme a Senha</label>
          <input
            type="password"
            id="passwordConfirm"
            className="form-control"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {/* Upload de Avatar */}
        <div className="mb-3">
          <label htmlFor="avatar" className="form-label">Avatar (opcional)</label>
          <input
            type="file"
            id="avatar"
            className="form-control"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {/* Botão de submit */}
        <button type="submit" className="btn btn-primary w-100">
          Cadastrar
        </button>
      </form>
    </div>
  );
};

export default Register;