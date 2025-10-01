import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f9fafb",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <h1 style={{ marginBottom: "20px", color: "#333" }}>Welcome to Resourcely</h1>
            <div style={{ display: "flex", gap: "15px" }}>
                <button 
                    id="login-btn"
                    onClick={() => navigate("/login")}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "16px",
                    }}
                >
                    Login
                </button>
                <button
                    id="register-btn"
                    onClick={() => navigate("/signup")}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#10b981",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "16px",
                    }}
                >
                    Register
                </button>
            </div>
        </div>
    );
};

export default HomePage;
