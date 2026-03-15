const router = require("express").Router()

const controller = require("../controllers/userController")
const auth       = require("../middlewares/auth")
const validate   = require("../middlewares/validate")

const {
  registerSchema,
  loginSchema,
  updateUserSchema
} = require("../validators/userValidator")

router.post("/register", validate(registerSchema), controller.register)
router.post("/login",    validate(loginSchema),    controller.login)

router.get("/:id",    auth, controller.getUser)
router.put("/:id",    auth, validate(updateUserSchema), controller.updateUser)
router.delete("/:id", auth, controller.deleteUser)

module.exports = router
