const router = require("express").Router()

const controller = require("../controllers/reservationController")
const auth       = require("../middlewares/auth")
const admin      = require("../middlewares/admin")
const validate   = require("../middlewares/validate")

const {
  createReservationSchema,
  updateReservationSchema
} = require("../validators/reservationValidator")

// IMPORTANT: static route /search MUST be declared before /:id
// otherwise Express will match "search" as an :id parameter
router.get("/search", auth, admin, controller.searchReservations)

router.get("/",       auth, controller.getReservations)
router.post("/",      auth, validate(createReservationSchema), controller.createReservation)
router.put("/:id",    auth, validate(updateReservationSchema), controller.updateReservation)
router.delete("/:id", auth, controller.deleteReservation)

module.exports = router
