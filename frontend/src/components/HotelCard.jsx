import { Link } from "react-router-dom"
import "./HotelCard.css"

const HotelCard = ({ hotel }) => {
  const img = hotel.picture_list?.[0]

  return (
    <Link to={`/hotels/${hotel._id}`} className="hotel-card card">
      <div className="hotel-card-img">
        {img
          ? <img src={img} alt={hotel.name} />
          : <div className="hotel-card-placeholder">◆</div>
        }
      </div>
      <div className="hotel-card-body">
        <div className="hotel-card-location">
          <span>📍</span> {hotel.location}
        </div>
        <h3 className="hotel-card-name">{hotel.name}</h3>
        {hotel.description && (
          <p className="hotel-card-desc">{hotel.description}</p>
        )}
        <span className="btn btn-outline btn-sm" style={{ marginTop: 12 }}>
          Voir l'hôtel →
        </span>
      </div>
    </Link>
  )
}

export default HotelCard
