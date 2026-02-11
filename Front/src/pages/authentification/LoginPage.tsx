import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./Auth.css";
import { login } from "../../services/AuthService";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const { role } = await login(email, password);
      navigate(role === "patrol" ? "/patrol" : "/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1 className="auth-title">Connexion Alertis</h1>
        <p className="auth-subtitle">Accédez à votre espace sécurisé</p>
      </div>

      <div className="auth-card">
        {error && (
          <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="password-input-group">
            <input
              className="auth-input"
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              title={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          <button type="submit" className="auth-button">
            Se connecter
          </button>
        </form>
        <p className="auth-footer">
          Pas encore de compte ?{" "}
          <Link to="/register" className="auth-link">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
};
