import { useEffect, useState } from "react"
import { getHotels } from "../api/hotelApi"
import HotelCard from "../components/HotelCard"

const Hotels = () => {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState("name")
  const [limit, setLimit] = useState(10)

  const load = () => {
    setLoading(true)
    getHotels({ sort, limit })
      .then(res => setHotels(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [sort, limit])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Nos Hôtels</h1>
        <p>Découvrez notre sélection d'établissements d'exception</p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
        <div className="form-group" style={{ margin: 0 }}>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{ width: "auto", padding: "8px 12px" }}
          >
            <option value="name">Trier par nom</option>
            <option value="location">Trier par lieu</option>
            <option value="-createdAt">Plus récents</option>
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <select
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
            style={{ width: "auto", padding: "8px 12px" }}
          >
            <option value={5}>5 par page</option>
            <option value={10}>10 par page</option>
            <option value={20}>20 par page</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : hotels.length === 0 ? (
        <div className="empty-state">
          <h3>Aucun hôtel disponible</h3>
          <p>Revenez bientôt pour découvrir nos destinations.</p>
        </div>
      ) : (
        <div className="grid-hotels">
          {hotels.map(h => <HotelCard key={h._id} hotel={h} />)}
        </div>
      )}
    </div>
  )
}

export default Hotels
