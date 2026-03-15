const User    = require("../models/User")
const bcrypt  = require("bcryptjs")
const jwt     = require("jsonwebtoken")
const mongoose = require("mongoose")

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

// ─── REGISTER ──────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { email, pseudo, password } = req.body

    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(409).json({ message: "Cet email est déjà utilisé" })
    }

    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ email, pseudo, password: hash })

    return res.status(201).json(user)
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
}

// ─── LOGIN ─────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ message: "Mot de passe incorrect" })
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    )

    return res.json({ token, userId: user._id })
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
}

// ─── GET USER ──────────────────────────────────────────
exports.getUser = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "ID utilisateur invalide" })
    }

    if (req.user.role !== "admin" && req.user.id !== req.params.id.toString()) {
      return res.status(403).json({ message: "Accès interdit" })
    }

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" })
    }

    return res.json(user)
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
}

// ─── UPDATE USER ───────────────────────────────────────
exports.updateUser = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "ID utilisateur invalide" })
    }

    if (req.user.role !== "admin" && req.user.id !== req.params.id.toString()) {
      return res.status(403).json({ message: "Accès interdit" })
    }

    const { email, pseudo, password } = req.body
    const updateData = {}
    if (email)    updateData.email  = email
    if (pseudo)   updateData.pseudo = pseudo
    if (password) updateData.password = await bcrypt.hash(password, 10)

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Aucun champ valide à mettre à jour" })
    }

    if (email) {
      const conflict = await User.findOne({ email, _id: { $ne: req.params.id } })
      if (conflict) {
        return res.status(409).json({ message: "Cet email est déjà utilisé" })
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" })
    }

    return res.json(user)
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
}

// ─── DELETE USER ───────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "ID utilisateur invalide" })
    }

    if (req.user.role !== "admin" && req.user.id !== req.params.id.toString()) {
      return res.status(403).json({ message: "Accès interdit" })
    }

    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" })
    }

    return res.json({ message: "Compte supprimé avec succès" })
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
}