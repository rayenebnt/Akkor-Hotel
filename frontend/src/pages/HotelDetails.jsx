import { useEffect, useState, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getHotel } from "../api/hotelApi"
import { createReservation } from "../api/reservationApi"
import { AuthContext } from "../context/AuthContext"

const HotelDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const today = new Date().toISOString().split("T")[0]
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [bookError, setBookError] = useState("")
  const [bookSuccess, setBookSuccess] = useState("")
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    getHotel(id)
      .then(res => setHotel(res.data))
      .catch(() => setError("Hôtel introuvable."))
      .finally(() => setLoading(false))
  }, [id])

  const handleBook = async (e) => {
    e.preventDefault()
    setBookError("")
    setBookSuccess("")

    if (!user) {
      navigate("/login")
      return
    }

    if (!dateFrom || !dateTo) {
      setBookError("Veuillez renseigner les deux dates.")
      return
    }

    if (new Date(dateFrom) >= new Date(dateTo)) {
      setBookError("La date de départ doit être après la date d'arrivée.")
      return
    }

    if (new Date(dateFrom) < new Date(today)) {
      setBookError("La date d'arrivée ne peut pas être dans le passé.")
      return
    }

    setBooking(true)
    try {
      await createReservation({ hotelId: id, dateFrom, dateTo })
      setBookSuccess("Réservation confirmée ! Retrouvez-la dans vos réservations.")
      setDateFrom("")
      setDateTo("")
    } catch (err) {
      setBookError(err.response?.data?.message || "Erreur lors de la réservation.")
    } finally {
      setBooking(false)
    }
  }

  if (loading) return <div className="spinner" />
  if (error) return (
    <div className="page">
      <div className="alert alert-error">{error}</div>
    </div>
  )

  return (
    <div className="page">
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }}>
        ← Retour
      </button>

      {/* Images */}
      {hotel.picture_list?.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 32, borderRadius: 8, overflow: "hidden", height: 300 }}>
          {hotel.picture_list.slice(0, 3).map((url, i) => (
            <img key={i} src={url} alt={hotel.name} style={{ flex: 1, objectFit: "cover", minWidth: 0 }} />
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 40, alignItems: "start" }}>
        {/* Info */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span className="badge badge-gold">{hotel.location}</span>
          </div>
          <h1 style={{ fontSize: "2rem", color: "var(--gold)", marginBottom: 16 }}>
            {hotel.name}
          </h1>
          <div className="divider" />
          <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
            {hotel.description || "Aucune description disponible."}
          </p>
        </div>

        {/* Booking Form */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: "1.1rem", color: "var(--gold)", marginBottom: 20 }}>
            Réserver cet hôtel
          </h3>

          {bookError && <div className="alert alert-error">{bookError}</div>}
          {bookSuccess && <div className="alert alert-success">{bookSuccess}</div>}

          {!bookSuccess && (
            <form onSubmit={handleBook}>
              <div className="form-group">
                <label>Date d'arrivée</label>
                <input
                  type="date"
                  min={today}
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date de départ</label>
                <input
                  type="date"
                  min={dateFrom || today}
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%" }}
                disabled={booking}
              >
                {booking ? "Réservation..." : user ? "Confirmer la réservation" : "Se connecter pour réserver"}
              </button>
            </form>
          )}

          {bookSuccess && (
            <button
              className="btn btn-outline"
              style={{ width: "100%" }}
              onClick={() => navigate("/reservations")}
            >
              Voir mes réservations
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default HotelDetails
