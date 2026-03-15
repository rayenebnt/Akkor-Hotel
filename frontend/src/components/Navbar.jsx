import { useContext } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import "./Navbar.css"

const Navbar = () => {
  const { user, logout, isAdmin } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const isActive = (path) => location.pathname === path ? "active" : ""

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">◆</span>
          <span>Akkor Hotel</span>
        </Link>

        <nav className="navbar-nav">
          <Link to="/" className={`nav-link ${isActive("/")}`}>Hotels</Link>

          {user && (
            <Link to="/reservations" className={`nav-link ${isActive("/reservations")}`}>
              Mes réservations
            </Link>
          )}

          {user && isAdmin() && (
            <Link to="/admin" className={`nav-link nav-link-admin ${isActive("/admin")}`}>
              Admin
            </Link>
          )}
        </nav>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/profile" className={`nav-link ${isActive("/profile")}`}>
                <span className="avatar">{user.role === "admin" ? "★" : "◎"}</span>
                Profil
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Connexion</Link>
              <Link to="/register" className="btn btn-primary btn-sm">S'inscrire</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
