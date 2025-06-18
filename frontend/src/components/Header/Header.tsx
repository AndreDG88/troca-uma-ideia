import { useAuth } from "../../context/AuthContext";
import styles from "./Header.module.css";
import Trends from "../Trends/Trends";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {/* Imagem da logo do projeto */}
        <img
          src="/media/troca-uma-ideia_brand.png"
          alt="Logo Troca uma Ideia"
          className={styles.logo}
        />

        {/* Área do avatar e nome do usuário */}
        {user && (
          <img
            src={`${user.profile.avatar}?t=${Date.now()}`}
            alt="Avatar"
            className={styles.avatar}
          />
        )}
      </div>

      {/* Área do nome do usuário e status */}
      {user && (
        <div className={styles.center}>
          <div className={styles.username}>Olá, @{user.username}!</div>
          <div className={styles.stats}>
            <strong>{user.profile.followers_count}</strong> seguidores ·{" "}
            <strong>{user.profile.following_count}</strong> seguindo
          </div>
        </div>
      )}
      
      {/* Chamada da trend */}
      <div className={styles.trendBox}>
        <Trends />
      </div>
    </header>
  );
};

export default Header;
