const mongoose = require("mongoose")

const HotelSchema = new mongoose.Schema({

 name: {
  type: String,
  required: true
 },

 location: {
  type: String,
  required: true
 },

 description: {
  type: String
 },

 picture_list: [
  {
   type: String
  }
 ]

})

module.exports = mongoose.model("Hotel", HotelSchema)