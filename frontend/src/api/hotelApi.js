import api from "./axios"

export const getHotels = (params = {}) =>
  api.get("/hotels", { params })

export const getHotel = (id) =>
  api.get(`/hotels/${id}`)

export const createHotel = (data) =>
  api.post("/hotels", data)

export const updateHotel = (id, data) =>
  api.put(`/hotels/${id}`, data)

export const deleteHotel = (id) =>
  api.delete(`/hotels/${id}`)
