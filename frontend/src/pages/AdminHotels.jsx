import { useEffect, useState } from "react"
import { getHotels, createHotel, updateHotel, deleteHotel } from "../api/hotelApi"

const emptyForm = { name: "", location: "", description: "", picture_list: "" }

const AdminHotels = () => {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [msg, setMsg] = useState({ type: "", text: "" })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getHotels({ limit: 50 })
      .then(res => setHotels(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg({ type: "", text: "" }), 3500)
  }

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.location.trim()) {
      showMsg("error", "Le nom et le lieu sont obligatoires.")
      return
    }
    setSaving(true)

    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      picture_list: form.picture_list
        ? form.picture_list.split("\n").map(s => s.trim()).filter(Boolean)
        : []
    }

    try {
      if (editingId) {
        const res = await updateHotel(editingId, payload)
        setHotels(prev => prev.map(h => h._id === editingId ? res.data : h))
        showMsg("success", "Hôtel mis à jour.")
      } else {
        const res = await createHotel(payload)
        setHotels(prev => [res.data, ...prev])
        showMsg("success", "Hôtel créé avec succès.")
      }
      setForm(emptyForm)
      setEditingId(null)
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Erreur lors de l'opération.")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (hotel) => {
    setEditingId(hotel._id)
    setForm({
      name: hotel.name,
      location: hotel.location,
      description: hotel.description || "",
      picture_list: hotel.picture_list?.join("\n") || ""
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet hôtel définitivement ?")) return
    try {
      await deleteHotel(id)
      setHotels(prev => prev.filter(h => h._id !== id))
      showMsg("success", "Hôtel supprimé.")
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Erreur lors de la suppression.")
    }
  }

  const handleCancel = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1>Administration</h1>
            <p>Gérez le catalogue d'hôtels</p>
          </div>
          <span className="badge badge-gold">Admin</span>
        </div>
      </div>

      {msg.text && (
        <div className={`alert ${msg.type === "error" ? "alert-error" : "alert-success"}`}>
          {msg.text}
        </div>
      )}

      {/* Form */}
      <div className="card" style={{ padding: 28, marginBottom: 40 }}>
        <h3 style={{ color: "var(--gold)", marginBottom: 20, fontSize: "1.1rem" }}>
          {editingId ? "✎ Modifier l'hôtel" : "+ Ajouter un hôtel"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Nom *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Grand Hôtel Palace" required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Lieu *</label>
              <input name="location" value={form.location} onChange={handleChange} placeholder="Paris, France" required />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description de l'hôtel..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>URLs des photos <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>(une par ligne)</span></label>
            <textarea
              name="picture_list"
              value={form.picture_list}
              onChange={handleChange}
              placeholder={"https://exemple.com/photo1.jpg\nhttps://exemple.com/photo2.jpg"}
              rows={3}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Sauvegarde..." : editingId ? "Mettre à jour" : "Créer l'hôtel"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={handleCancel}>
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <h2 style={{ fontSize: "1.3rem", marginBottom: 20 }}>
        Hôtels ({hotels.length})
      </h2>

      {loading ? (
        <div className="spinner" />
      ) : hotels.length === 0 ? (
        <div className="empty-state"><h3>Aucun hôtel enregistré</h3></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {hotels.map(hotel => (
            <div key={hotel._id} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
              {hotel.picture_list?.[0] && (
                <img
                  src={hotel.picture_list[0]}
                  alt={hotel.name}
                  style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4, flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "Playfair Display", fontSize: "1rem" }}>{hotel.name}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>📍 {hotel.location}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button className="btn btn-outline btn-sm" onClick={() => handleEdit(hotel)}>Modifier</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(hotel._id)}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminHotels
