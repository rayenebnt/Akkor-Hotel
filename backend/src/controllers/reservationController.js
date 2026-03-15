const Reservation = require("../models/Reservation")
const Hotel       = require("../models/Hotel")
const User        = require("../models/User")
const mongoose    = require("mongoose")

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

// ─── CREATE RESERVATION ────────────────────────────────
exports.createReservation = async (req, res) => {
  try {
    const { hotelId, dateFrom, dateTo } = req.body

    if (!isValidId(hotelId)) {
      return res.status(400).json({ message: "ID hôtel invalide" })
    }

    // Check hotel exists
    const hotel = await Hotel.findById(hotelId)
    if (!hotel) {
      return res.status(404).json({ message: "Hôtel introuvable" })
    }

    // Business rule: dateFrom < dateTo
    if (new Date(dateFrom) >= new Date(dateTo)) {
      return res.status(400).json({ message: "La date d'arrivée doit être avant la date de départ" })
    }

    const reservation = await Reservation.create({
      userId: req.user.id,
      hotelId,
      dateFrom,
      dateTo
    })

    const populated = await reservation.populate("hotelId")
    return res.status(201).json(populated)
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
}

// ─── GET MY RESERVATIONS ───────────────────────────────
exports.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation
      .find({ userId: req.user.id })
      .populate("hotelId")
      .sort({ dateFrom: 1 })

    return res.json(reservations)
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
}

// ─── UPDATE RESERVATION ────────────────────────────────
exports.updateReservation = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "ID réservation invalide" })
    }

    const reservation = await Reservation.findById(req.params.id)
    if (!reservation) {
      return res.status(404).json({ message: "Réservation introuvable" })
    }

    if (reservation.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès interdit" })
    }

    const { dateFrom, dateTo } = req.body

    // Validate dates if provided
    const newFrom = dateFrom ? new Date(dateFrom) : reservation.dateFrom
    const newTo   = dateTo   ? new Date(dateTo)   : reservation.dateTo

    if (newFrom >= newTo) {
      return res.status(400).json({ message: "La date d'arrivée doit être avant la date de départ" })
    }

    const updated = await Reservation.findByIdAndUpdate(
      req.params.id,
      { dateFrom: newFrom, dateTo: newTo },
      { new: true }
    ).populate("hotelId")

    return res.json(updated)
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
}

// ─── DELETE RESERVATION ────────────────────────────────
exports.deleteReservation = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "ID réservation invalide" })
    }

    const reservation = await Reservation.findById(req.params.id)
    if (!reservation) {
      return res.status(404).json({ message: "Réservation introuvable" })
    }

    if (reservation.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès interdit" })
    }

    await Reservation.findByIdAndDelete(req.params.id)
    return res.json({ message: "Réservation supprimée avec succès" })
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
}

// ─── ADMIN: SEARCH BY EMAIL OR NAME ───────────────────
exports.searchReservations = async (req, res) => {
  try {
    const { email, pseudo, id } = req.query

    // Search by reservation ID directly
    if (id) {
      if (!isValidId(id)) {
        return res.status(400).json({ message: "ID réservation invalide" })
      }
      const reservation = await Reservation.findById(id).populate("hotelId userId")
      if (!reservation) {
        return res.status(404).json({ message: "Réservation introuvable" })
      }
      return res.json([reservation])
    }

    // Search user by email or pseudo
    if (!email && !pseudo) {
      return res.status(400).json({ message: "Paramètre email, pseudo ou id requis" })
    }

    const query = {}
    if (email)  query.email  = email
    if (pseudo) query.pseudo = new RegExp(pseudo, "i")

    const user = await User.findOne(query)
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" })
    }

    const reservations = await Reservation
      .find({ userId: user._id })
      .populate("hotelId")
      .populate("userId")
      .sort({ dateFrom: 1 })

    return res.json(reservations)
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
}
