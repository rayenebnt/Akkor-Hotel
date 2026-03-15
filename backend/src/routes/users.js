const router = require("express").Router()

const controller = require("../controllers/userController")
const auth = require("../middlewares/auth")

const validate = require("../middlewares/validate")
const {registerSchema} = require("../validators/userValidator")

router.post(
 "/register",
 validate(registerSchema),
 controller.register
)

router.post("/login",controller.login)

router.get("/:id",auth,controller.getUser)

router.put("/:id",auth,controller.updateUser)

router.delete("/:id",auth,controller.deleteUser)

module.exports = router