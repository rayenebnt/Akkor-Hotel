const router = require("express").Router()

const controller = require("../controllers/reservationController")

const auth = require("../middlewares/auth")
const admin = require("../middlewares/admin")

// user routes
router.get("/", auth, controller.getReservations)
router.post("/", auth, controller.createReservation)
router.put("/:id", auth, controller.updateReservation)
router.delete("/:id", auth, controller.deleteReservation)

// admin search
router.get("/search", auth, admin, controller.searchReservationByEmail)

module.exports = router