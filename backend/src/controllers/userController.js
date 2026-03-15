const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")

// =====================
// REGISTER
// =====================

exports.register = async (req, res) => {

 try {

  const { email, pseudo, password, role } = req.body

  const hash = await bcrypt.hash(password, 10)

  const user = await User.create({
   email,
   pseudo,
   password: hash,
   role: role || "user"
  })

  res.status(201).json(user)

 } catch (error) {

  res.status(500).json({ error: error.message })

 }

}

// =====================
// LOGIN
// =====================

exports.login = async (req, res) => {

 try {

  const { email, password } = req.body

  const user = await User.findOne({ email })

  if (!user) {
   return res.status(404).json({ message: "User not found" })
  }

  const valid = await bcrypt.compare(password, user.password)

  if (!valid) {
   return res.status(401).json({ message: "Invalid password" })
  }

  const token = jwt.sign(
   { id: user._id, role: user.role },
   process.env.JWT_SECRET || "secret",
   { expiresIn: "1d" }
  )

  return res.json({
   token,
   userId: user._id
  })

 } catch (error) {

  return res.status(500).json({ error: error.message })

 }

}

// =====================
// GET USER
// =====================

exports.getUser = async (req, res) => {

 try {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
   return res.status(400).json({ message: "Invalid user id" })
  }

  const user = await User.findById(req.params.id)

  if (!user) {
   return res.status(404).json({ message: "User not found" })
  }

  res.json(user)

 } catch (error) {

  res.status(500).json({ error: error.message })

 }

}

// =====================
// UPDATE USER
// =====================

exports.updateUser = async (req, res) => {

 try {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
   return res.status(400).json({ message: "Invalid user id" })
  }

  if (req.user.id !== req.params.id && req.user.role !== "admin") {
   return res.status(403).json({ message: "Forbidden" })
  }

  const user = await User.findByIdAndUpdate(
   req.params.id,
   req.body,
   { new: true }
  )

  if (!user) {
   return res.status(404).json({ message: "User not found" })
  }

  res.json(user)

 } catch (error) {

  res.status(500).json({ error: error.message })

 }

}

// =====================
// DELETE USER
// =====================

exports.deleteUser = async (req, res) => {

 try {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
   return res.status(400).json({ message: "Invalid user id" })
  }

  if (req.user.id !== req.params.id && req.user.role !== "admin") {
   return res.status(403).json({ message: "Forbidden" })
  }

  const user = await User.findByIdAndDelete(req.params.id)

  if (!user) {
   return res.status(404).json({ message: "User not found" })
  }

  res.json({ message: "User deleted" })

 } catch (error) {

  res.status(500).json({ error: error.message })

 }

}