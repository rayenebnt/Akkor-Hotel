const mongoose = require("mongoose")

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/akkor-hotel"

  try {
    await mongoose.connect(uri)
    console.log("MongoDB connecté :", uri)
  } catch (error) {
    console.error("Erreur de connexion MongoDB :", error.message)
    process.exit(1)
  }
}

module.exports = connectDB
