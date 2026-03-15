import api from "./axios"

export const register = (data) => {
 return api.post("/users/register", data)
}

export const login = (data) => {
 return api.post("/users/login", data)
}