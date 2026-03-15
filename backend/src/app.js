require("dotenv").config()

const express  = require("express")
const cors     = require("cors")
const path     = require("path")

const connectDB = require("./config/db")

const swaggerUi    = require("swagger-ui-express")
const YAML         = require("yamljs")

const userRoutes        = require("./routes/users")
const hotelRoutes       = require("./routes/hotels")
const reservationRoutes = require("./routes/reservations")

const app = express()

// ─── DB ────────────────────────────────────────────────
connectDB()

// ─── MIDDLEWARES ───────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map(o => o.trim())
  : ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173"]

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, Postman, Swagger)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(null, true) // permissive in dev — restrict in prod via FRONTEND_URL
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}))
app.options("*", cors()) // handle preflight requests
app.use(express.json())

// ─── SWAGGER ───────────────────────────────────────────
try {
  const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"))
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
} catch (e) {
  console.warn("Swagger non chargé :", e.message)
}

// ─── ROUTES ────────────────────────────────────────────
app.use("/users",        userRoutes)
app.use("/hotels",       hotelRoutes)
app.use("/reservations", reservationRoutes)

// ─── 404 ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route introuvable" })
})

// ─── GLOBAL ERROR HANDLER ──────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Erreur interne du serveur" })
})

module.exports = app