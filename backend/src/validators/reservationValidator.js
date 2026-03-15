const Joi = require("joi")

exports.createReservationSchema = Joi.object({
  hotelId:  Joi.string().required().messages({
    "any.required": "hotelId est requis"
  }),
  dateFrom: Joi.date().iso().required().messages({
    "any.required": "dateFrom est requis",
    "date.format": "dateFrom doit être une date ISO valide"
  }),
  dateTo:   Joi.date().iso().greater(Joi.ref("dateFrom")).required().messages({
    "any.required": "dateTo est requis",
    "date.greater": "dateTo doit être après dateFrom"
  })
})

exports.updateReservationSchema = Joi.object({
  dateFrom: Joi.date().iso(),
  dateTo:   Joi.date().iso()
}).min(1)
