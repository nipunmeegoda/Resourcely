import { useNavigate } from "react-router-dom";
import "./homePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to Resourcely</h1>
      <div className="home-buttons">
        <button
          onClick={() => navigate("/login")}
          className="home-button home-button-login"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="home-button home-button-register"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default HomePage;
