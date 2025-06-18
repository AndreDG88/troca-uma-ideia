import { Outlet, useLocation } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import styles from "./Layout.module.css";

const Layout = () => {
  const location = useLocation();
  const hideHeaderOn = ["/profile"];
  const shouldHideHeader = hideHeaderOn.includes(location.pathname);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {!shouldHideHeader && <Header />}
        <main className={styles.main}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
