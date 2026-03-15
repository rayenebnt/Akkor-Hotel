const Joi = require("joi")

exports.createHotelSchema = Joi.object({
  name:         Joi.string().min(2).max(100).required().messages({
    "any.required": "Le nom est requis"
  }),
  location:     Joi.string().min(2).max(100).required().messages({
    "any.required": "Le lieu est requis"
  }),
  description:  Joi.string().max(2000).allow(""),
  picture_list: Joi.array().items(Joi.string().uri()).default([])
})

exports.updateHotelSchema = Joi.object({
  name:         Joi.string().min(2).max(100),
  location:     Joi.string().min(2).max(100),
  description:  Joi.string().max(2000).allow(""),
  picture_list: Joi.array().items(Joi.string().uri())
}).min(1)
