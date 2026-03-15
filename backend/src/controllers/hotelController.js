const Hotel = require("../models/Hotel")

// GET /hotels
exports.listHotels = async (req, res) => {
 try {

  const limit = parseInt(req.query.limit) || 10
  const sort = req.query.sort || "name"

  const hotels = await Hotel
   .find()
   .sort(sort)
   .limit(limit)

  res.json(hotels)

 } catch (error) {

  res.status(500).json({ message: error.message })

 }
}

// GET /hotels/:id
exports.getHotel = async (req, res) => {

 try {

  const hotel = await Hotel.findById(req.params.id)

  if (!hotel) {
   return res.status(404).json({ message: "Hotel not found" })
  }

  res.json(hotel)

 } catch (error) {

  res.status(500).json({ message: error.message })

 }
}

// POST /hotels
exports.createHotel = async (req, res) => {

 try {

  const { name, location, description, picture_list } = req.body

  if (!name || !location) {
   return res.status(400).json({
    message: "Name and location are required"
   })
  }

  const hotel = await Hotel.create({
   name,
   location,
   description,
   picture_list
  })

  res.status(201).json(hotel)

 } catch (error) {

  res.status(500).json({ message: error.message })

 }
}

// PUT /hotels/:id
exports.updateHotel = async (req, res) => {

 try {

  const hotel = await Hotel.findByIdAndUpdate(
   req.params.id,
   req.body,
   { new: true }
  )

  if (!hotel) {
   return res.status(404).json({ message: "Hotel not found" })
  }

  res.json(hotel)

 } catch (error) {

  res.status(500).json({ message: error.message })

 }
}

// DELETE /hotels/:id
exports.deleteHotel = async (req, res) => {

 try {

  const hotel = await Hotel.findByIdAndDelete(req.params.id)

  if (!hotel) {
   return res.status(404).json({ message: "Hotel not found" })
  }

  res.json({ message: "Hotel deleted" })

 } catch (error) {

  res.status(500).json({ message: error.message })

 }
}