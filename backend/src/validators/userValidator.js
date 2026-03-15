const Joi = require("joi")

exports.registerSchema = Joi.object({
 email: Joi.string().email().required(),
 pseudo: Joi.string().min(3).max(30).required(),
 password: Joi.string().min(6).required(),
 role: Joi.string().valid("user","admin")
})