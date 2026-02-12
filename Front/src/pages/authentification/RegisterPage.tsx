import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { register, validatePassword } from "../../services/AuthService";
import "./Auth.css";

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    lastName: "",
    firstName: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSymbol: false,
  });
  const navigate = useNavigate();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    // Utiliser la fonction de validation du service
    const requirements = validatePassword(password);
    setPasswordRequirements(requirements);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      await register(formData);
      setSuccessMessage("Inscription réussie ! Redirection en cours...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1 className="auth-title">Créer un compte</h1>
        <p className="auth-subtitle">Sécurisez-vous avec Alertis</p>
      </div>

      <div className="auth-card">
        {error && (
          <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
        )}
        {successMessage && (
          <div style={{ color: "green", marginBottom: "1rem" }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <input
              className="auth-input"
              placeholder="Prénom"
              required
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
            <input
              className="auth-input"
              placeholder="Nom"
              required
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />
          </div>
          <div className="auth-input-group">
            <input
              className="auth-input"
              type="tel"
              placeholder="Téléphone"
              required
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
            <input
              className="auth-input"
              type="email"
              placeholder="Email"
              required
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div className="password-input-group">
            <input
              className="auth-input"
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              required
              onChange={handlePasswordChange}
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
          <div className="password-requirements">
            <div
              className={`requirement ${passwordRequirements.minLength ? "met" : ""}`}
            >
              <span className="requirement-icon">
                {passwordRequirements.minLength ? "✓" : "○"}
              </span>
              Minimum 6 caractères
            </div>
            <div
              className={`requirement ${passwordRequirements.hasUppercase ? "met" : ""}`}
            >
              <span className="requirement-icon">
                {passwordRequirements.hasUppercase ? "✓" : "○"}
              </span>
              Une lettre majuscule
            </div>
            <div
              className={`requirement ${passwordRequirements.hasNumber ? "met" : ""}`}
            >
              <span className="requirement-icon">
                {passwordRequirements.hasNumber ? "✓" : "○"}
              </span>
              Un chiffre
            </div>
            <div
              className={`requirement ${passwordRequirements.hasSymbol ? "met" : ""}`}
            >
              <span className="requirement-icon">
                {passwordRequirements.hasSymbol ? "✓" : "○"}
              </span>
              Un symbole (!@#$%^&*...)
            </div>
          </div>

          <button type="submit" className="auth-button">
            S'inscrire
          </button>
        </form>

        <p className="auth-footer">
          Déjà inscrit ?{" "}
          <Link to="/login" className="auth-link">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};