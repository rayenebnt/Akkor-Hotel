import { useEffect, useState } from "react"
import { getReservations, updateReservation, deleteReservation } from "../api/reservationApi"

const formatDate = (d) => new Date(d).toLocaleDateString("fr-FR", {
  day: "numeric", month: "long", year: "numeric"
})

const ReservationItem = ({ reservation, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false)
  const [dateFrom, setDateFrom] = useState(reservation.dateFrom?.slice(0, 10))
  const [dateTo, setDateTo] = useState(reservation.dateTo?.slice(0, 10))
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const hotel = reservation.hotelId

  const handleSave = async () => {
    setError("")
    if (new Date(dateFrom) >= new Date(dateTo)) {
      setError("La date de départ doit être après l'arrivée.")
      return
    }
    setSaving(true)
    try {
      await onUpdate(reservation._id, { dateFrom, dateTo })
      setEditing(false)
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card" style={{ padding: 24, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Playfair Display", fontSize: "1.1rem", marginBottom: 4 }}>
            {hotel?.name || "Hôtel inconnu"}
          </div>
          {hotel?.location && (
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
              📍 {hotel.location}
            </div>
          )}

          {editing ? (
            <div>
              {error && <div className="alert alert-error" style={{ padding: "8px 12px", fontSize: 13 }}>{error}</div>}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 140 }}>
                  <label>Arrivée</label>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 140 }}>
                  <label>Départ</label>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Sauvegarde..." : "Sauvegarder"}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setError("") }}>
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Arrivée</div>
                <div style={{ fontSize: 14 }}>{formatDate(reservation.dateFrom)}</div>
              </div>
              <div style={{ color: "var(--text-dim)" }}>→</div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Départ</div>
                <div style={{ fontSize: 14 }}>{formatDate(reservation.dateTo)}</div>
              </div>
            </div>
          )}
        </div>

        {!editing && (
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
              Modifier
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(reservation._id)}>
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const Reservations = () => {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = () => {
    setLoading(true)
    getReservations()
      .then(res => setReservations(res.data))
      .catch(() => setError("Impossible de charger les réservations."))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleUpdate = async (id, data) => {
    const res = await updateReservation(id, data)
    setReservations(prev => prev.map(r => r._id === id ? res.data : r))
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette réservation ?")) return
    await deleteReservation(id)
    setReservations(prev => prev.filter(r => r._id !== id))
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Mes Réservations</h1>
        <p>Gérez vos séjours à venir</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner" />
      ) : reservations.length === 0 ? (
        <div className="empty-state">
          <h3>Aucune réservation</h3>
          <p>Parcourez nos hôtels pour faire votre première réservation.</p>
        </div>
      ) : (
        <div>
          {reservations.map(r => (
            <ReservationItem
              key={r._id}
              reservation={r}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Reservations
