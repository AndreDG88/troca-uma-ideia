import styles from "./Footer.module.css";

const Footer = () => (
  <footer className={styles.footer}>
    {new Date().getFullYear()} – © Troca uma Ideia. Todos os direitos reservados.&nbsp;
    Página criada para fins de estudo. Criado por{" "}
    <a href="https://www.linkedin.com/in/andre-soares88" target="_blank" rel="noopener noreferrer">
      André Soares
    </a>, veja mais projetos no meu{" "}
    <a href="https://github.com/AndreDG88" target="_blank" rel="noopener noreferrer">
      GitHub
    </a>.
  </footer>
);

export default Footer;
