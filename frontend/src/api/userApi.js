import api from "./axios"

export const getUser = (id) =>
  api.get(`/users/${id}`)

export const updateUser = (id, data) =>
  api.put(`/users/${id}`, data)

export const deleteUser = (id) =>
  api.delete(`/users/${id}`)
