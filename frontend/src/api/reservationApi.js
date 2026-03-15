import api from "./axios"

export const getReservations = () =>
  api.get("/reservations")

export const createReservation = (data) =>
  api.post("/reservations", data)

export const updateReservation = (id, data) =>
  api.put(`/reservations/${id}`, data)

export const deleteReservation = (id) =>
  api.delete(`/reservations/${id}`)
