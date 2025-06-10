import { Outlet, useLocation } from "react-router-dom";
import Header from "../Header/Header";

const Layout = () => {
  const location = useLocation();
  const hideHeaderOn = ["/", "/profile"];

  const shouldHideHeader = hideHeaderOn.includes(location.pathname);

  return (
    <>
      {!shouldHideHeader && <Header />}
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
