import { useEffect, useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { getUser, updateUser, deleteUser } from "../api/userApi"

const Profile = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const [pseudo, setPseudo] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [updateMsg, setUpdateMsg] = useState({ type: "", text: "" })
  const [updating, setUpdating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    getUser(user.id)
      .then(res => {
        setProfile(res.data)
        setPseudo(res.data.pseudo)
        setEmail(res.data.email)
      })
      .catch(() => setUpdateMsg({ type: "error", text: "Impossible de charger le profil." }))
      .finally(() => setLoading(false))
  }, [user])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdateMsg({ type: "", text: "" })
    setUpdating(true)

    const payload = { pseudo, email }
    if (password.trim()) {
      if (password.length < 6) {
        setUpdateMsg({ type: "error", text: "Le nouveau mot de passe doit faire au moins 6 caractères." })
        setUpdating(false)
        return
      }
      payload.password = password
    }

    try {
      const res = await updateUser(user.id, payload)
      setProfile(res.data)
      setPassword("")
      setUpdateMsg({ type: "success", text: "Profil mis à jour avec succès." })
    } catch (err) {
      setUpdateMsg({ type: "error", text: err.response?.data?.message || "Erreur lors de la mise à jour." })
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteUser(user.id)
      logout()
      navigate("/")
    } catch (err) {
      setUpdateMsg({ type: "error", text: err.response?.data?.message || "Erreur lors de la suppression." })
      setShowDeleteConfirm(false)
    }
  }

  if (loading) return <div className="spinner" />

  return (
    <div className="page">
      <div className="page-header">
        <h1>Mon Profil</h1>
        <p>Gérez vos informations personnelles</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
        {/* Info Card */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "var(--gold-dim)", border: "2px solid var(--gold)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, color: "var(--gold)"
            }}>
              {profile?.role === "admin" ? "★" : "◎"}
            </div>
            <div>
              <div style={{ fontFamily: "Playfair Display", fontSize: "1.2rem" }}>
                {profile?.pseudo}
              </div>
              <span className={`badge ${profile?.role === "admin" ? "badge-gold" : "badge-muted"}`}>
                {profile?.role}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Email</span>
              <span style={{ fontSize: 14 }}>{profile?.email}</span>
            </div>
            <div className="divider" style={{ margin: "4px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Pseudo</span>
              <span style={{ fontSize: 14 }}>{profile?.pseudo}</span>
            </div>
            <div className="divider" style={{ margin: "4px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Rôle</span>
              <span style={{ fontSize: 14 }}>{profile?.role}</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ marginBottom: 24, color: "var(--gold)", fontSize: "1.1rem" }}>
            Modifier mes informations
          </h3>

          {updateMsg.text && (
            <div className={`alert ${updateMsg.type === "error" ? "alert-error" : "alert-success"}`}>
              {updateMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Pseudo</label>
              <input
                type="text"
                value={pseudo}
                onChange={e => setPseudo(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Nouveau mot de passe <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>(laisser vide pour ne pas changer)</span></label>
              <input
                type="password"
                placeholder="6 caractères minimum"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={updating}
            >
              {updating ? "Mise à jour..." : "Sauvegarder"}
            </button>
          </form>

          <div className="divider" />

          {!showDeleteConfirm ? (
            <button
              className="btn btn-danger"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Supprimer mon compte
            </button>
          ) : (
            <div style={{ background: "var(--danger-dim)", border: "1px solid rgba(192,57,43,0.3)", borderRadius: "var(--radius)", padding: 16 }}>
              <p style={{ color: "#e74c3c", fontSize: 14, marginBottom: 12 }}>
                ⚠️ Cette action est irréversible. Voulez-vous vraiment supprimer votre compte ?
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                  Confirmer la suppression
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowDeleteConfirm(false)}>
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
