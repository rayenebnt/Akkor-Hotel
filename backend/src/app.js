require("dotenv").config()

const express = require("express")
const cors = require("cors")

const connectDB = require("./config/db")

const swaggerUi = require("swagger-ui-express")
const YAML = require("yamljs")
const path = require("path")

const swaggerDocument = YAML.load(
 path.join(__dirname, "../swagger.yaml")
)

const userRoutes = require("./routes/users")
const hotelRoutes = require("./routes/hotels")
const reservationRoutes = require("./routes/reservations")

const app = express()

connectDB()

app.use(cors())   // IMPORTANT
app.use(express.json())

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use("/users", userRoutes)
app.use("/hotels", hotelRoutes)
app.use("/reservations", reservationRoutes)

module.exports = app