import { useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import "./AuthForm.css"

const Login = () => {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email, password)
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.message || "Identifiants invalides.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card card">
        <div className="auth-header">
          <span className="auth-icon">◆</span>
          <h1>Connexion</h1>
          <p>Bienvenue à nouveau</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="auth-footer">
          Pas encore de compte ?{" "}
          <Link to="/register" style={{ color: "var(--gold)" }}>S'inscrire</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
