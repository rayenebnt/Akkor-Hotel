import { createContext, useState, useEffect } from "react"
import api from "../api/axios"
import { jwtDecode } from "jwt-decode"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on page reload
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded = jwtDecode(token)
        // Check expiry
        if (decoded.exp * 1000 > Date.now()) {
          setUser({ id: decoded.id, role: decoded.role })
        } else {
          localStorage.removeItem("token")
        }
      } catch {
        localStorage.removeItem("token")
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post("/users/login", { email, password })
    const { token } = res.data
    localStorage.setItem("token", token)
    const decoded = jwtDecode(token)
    setUser({ id: decoded.id, role: decoded.role })
    return res.data
  }

  const register = async (email, pseudo, password) => {
    const res = await api.post("/users/register", { email, pseudo, password })
    return res.data
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  const isAdmin = () => user?.role === "admin"

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}
