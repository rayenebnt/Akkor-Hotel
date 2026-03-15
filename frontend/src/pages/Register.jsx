import { useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import "./AuthForm.css"

const Register = () => {
  const { register } = useContext(AuthContext)
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [pseudo, setPseudo] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }

    setLoading(true)
    try {
      await register(email, pseudo, password)
      navigate("/login")
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création du compte.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card card">
        <div className="auth-header">
          <span className="auth-icon">◆</span>
          <h1>Inscription</h1>
          <p>Créez votre compte Akkor Hotel</p>
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
            />
          </div>

          <div className="form-group">
            <label>Pseudo</label>
            <input
              type="text"
              placeholder="votre pseudo"
              value={pseudo}
              onChange={e => setPseudo(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              placeholder="6 caractères minimum"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
            disabled={loading}
          >
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className="auth-footer">
          Déjà un compte ?{" "}
          <Link to="/login" style={{ color: "var(--gold)" }}>Se connecter</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
