const Hotel    = require("../models/Hotel")
const mongoose = require("mongoose")

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

// ─── LIST HOTELS ───────────────────────────────────────
// GET /hotels?limit=10&sort=name
exports.listHotels = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100) // cap at 100
    const sort  = ["name", "location", "-createdAt", "createdAt"].includes(req.query.sort)
      ? req.query.sort
      : "name"

    const hotels = await Hotel.find().sort(sort).limit(limit)
    return res.json(hotels)
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
}

// ─── GET HOTEL ─────────────────────────────────────────
exports.getHotel = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "ID hôtel invalide" })
    }

    const hotel = await Hotel.findById(req.params.id)
    if (!hotel) {
      return res.status(404).json({ message: "Hôtel introuvable" })
    }

    return res.json(hotel)
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
}

// ─── CREATE HOTEL (admin only) ─────────────────────────
exports.createHotel = async (req, res) => {
  try {
    const { name, location, description, picture_list } = req.body

    const hotel = await Hotel.create({ name, location, description, picture_list })
    return res.status(201).json(hotel)
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
}

// ─── UPDATE HOTEL (admin only) ─────────────────────────
exports.updateHotel = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "ID hôtel invalide" })
    }

    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!hotel) {
      return res.status(404).json({ message: "Hôtel introuvable" })
    }

    return res.json(hotel)
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
}

// ─── DELETE HOTEL (admin only) ─────────────────────────
exports.deleteHotel = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "ID hôtel invalide" })
    }

    const hotel = await Hotel.findByIdAndDelete(req.params.id)
    if (!hotel) {
      return res.status(404).json({ message: "Hôtel introuvable" })
    }

    return res.json({ message: "Hôtel supprimé avec succès" })
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
}
