const Joi = require("joi")

exports.registerSchema = Joi.object({
  email:    Joi.string().email().required().messages({
    "string.email": "Email invalide",
    "any.required": "Email requis"
  }),
  pseudo:   Joi.string().min(3).max(30).required().messages({
    "string.min": "Le pseudo doit faire au moins 3 caractères",
    "any.required": "Pseudo requis"
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Le mot de passe doit faire au moins 6 caractères",
    "any.required": "Mot de passe requis"
  })
}).options({ allowUnknown: true }) // ignore les champs inconnus comme "role"

exports.loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required()
})

exports.updateUserSchema = Joi.object({
  email:    Joi.string().email(),
  pseudo:   Joi.string().min(3).max(30),
  password: Joi.string().min(6)
  // role is NOT patchable by users
}).min(1).messages({
  "object.min": "Au moins un champ doit être fourni"
})
