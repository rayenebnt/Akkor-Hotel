const router = require("express").Router()

const controller = require("../controllers/hotelController")

const auth = require("../middlewares/auth")
const admin = require("../middlewares/admin")

// public
router.get("/", controller.listHotels)
router.get("/:id", controller.getHotel)

// admin only
router.post("/", auth, admin, controller.createHotel)
router.put("/:id", auth, admin, controller.updateHotel)
router.delete("/:id", auth, admin, controller.deleteHotel)

module.exports = router