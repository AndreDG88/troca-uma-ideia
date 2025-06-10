import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header>
      <nav>
        <Link to="/">Início</Link>
        <Link to="/mytweets">Meus Tweets</Link>
        <Link to="/profile">Perfil</Link>
        <button onClick={handleLogout}>Sair</button>
        {user && <span>Olá, {user.username}!</span>}
      </nav>
    </header>
  );
};

export default Header;
