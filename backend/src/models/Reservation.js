const mongoose = require("mongoose")

const ReservationSchema = new mongoose.Schema({

 userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true
 },

 hotelId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Hotel",
  required: true
 },

 dateFrom: {
  type: Date,
  required: true
 },

 dateTo: {
  type: Date,
  required: true
 }

})

module.exports = mongoose.model("Reservation", ReservationSchema)