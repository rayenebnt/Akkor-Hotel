const mongoose = require("mongoose")

const HotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    picture_list: [
      { type: String }
    ]
  },
  { timestamps: true }
)

module.exports = mongoose.model("Hotel", HotelSchema)
