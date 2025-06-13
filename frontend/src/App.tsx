import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Profile from "./pages/Profile/Profile";
import MyTweets from "./pages/MyTweets/MyTweets";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout/Layout";

const App = () => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rota profile */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/:username"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />

      {/* Rotas que usam o Layout padrão */}
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/mytweets"
          element={
            <PrivateRoute>
              <MyTweets />
            </PrivateRoute>
          }
        />
      </Route>

      {/* Página não encontrada */}
      <Route path="*" element={<h2>Página não encontrada</h2>} />
    </Routes>
  );
};

export default App;

