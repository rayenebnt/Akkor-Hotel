const Reservation = require("../models/Reservation")
const User = require("../models/User")

// CREATE reservation
exports.createReservation = async (req, res) => {

 try {

  const { hotelId, dateFrom, dateTo } = req.body

  if (!hotelId || !dateFrom || !dateTo) {
   return res.status(400).json({
    message: "hotelId, dateFrom and dateTo are required"
   })
  }

  if (new Date(dateFrom) >= new Date(dateTo)) {
   return res.status(400).json({
    message: "dateFrom must be before dateTo"
   })
  }

  const reservation = await Reservation.create({
   userId: req.user.id,
   hotelId,
   dateFrom,
   dateTo
  })

  res.status(201).json(reservation)

 } catch (error) {

  res.status(500).json({ message: error.message })

 }
}

// GET reservations for logged user
exports.getReservations = async (req, res) => {

 try {

  const reservations = await Reservation.find({
   userId: req.user.id
  }).populate("hotelId")

  res.json(reservations)

 } catch (error) {

  res.status(500).json({ message: error.message })

 }
}

// UPDATE reservation
exports.updateReservation = async (req, res) => {

 try {

  const reservation = await Reservation.findById(req.params.id)

  if (!reservation) {
   return res.status(404).json({ message: "Reservation not found" })
  }

  if (reservation.userId.toString() !== req.user.id && req.user.role !== "admin") {
   return res.status(403).json({ message: "Forbidden" })
  }

  const updatedReservation = await Reservation.findByIdAndUpdate(
   req.params.id,
   req.body,
   { new: true }
  )

  res.json(updatedReservation)

 } catch (error) {

  res.status(500).json({ message: error.message })

 }
}

// DELETE reservation
exports.deleteReservation = async (req, res) => {

 try {

  const reservation = await Reservation.findById(req.params.id)

  if (!reservation) {
   return res.status(404).json({ message: "Reservation not found" })
  }

  if (reservation.userId.toString() !== req.user.id && req.user.role !== "admin") {
   return res.status(403).json({ message: "Forbidden" })
  }

  await Reservation.findByIdAndDelete(req.params.id)

  res.json({ message: "Reservation deleted" })

 } catch (error) {

  res.status(500).json({ message: error.message })

 }
}

// ADMIN search reservation by email
exports.searchReservationByEmail = async (req, res) => {

 try {

  const user = await User.findOne({
   email: req.query.email
  })

  if (!user) {
   return res.status(404).json({ message: "User not found" })
  }

  const reservations = await Reservation.find({
   userId: user._id
  }).populate("hotelId")

  res.json(reservations)

 } catch (error) {

  res.status(500).json({ message: error.message })

 }
}