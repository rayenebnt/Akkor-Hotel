const router = require("express").Router()

const controller = require("../controllers/hotelController")
const auth       = require("../middlewares/auth")
const admin      = require("../middlewares/admin")
const validate   = require("../middlewares/validate")

const {
  createHotelSchema,
  updateHotelSchema
} = require("../validators/hotelValidator")

// Public
router.get("/",    controller.listHotels)
router.get("/:id", controller.getHotel)

// Admin only
router.post("/",    auth, admin, validate(createHotelSchema), controller.createHotel)
router.put("/:id",  auth, admin, validate(updateHotelSchema), controller.updateHotel)
router.delete("/:id", auth, admin, controller.deleteHotel)

module.exports = router
