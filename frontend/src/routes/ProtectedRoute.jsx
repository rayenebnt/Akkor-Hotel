import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext)

  if (loading) return <div className="spinner" />
  if (!user) return <Navigate to="/login" replace />

  return children
}

export const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useContext(AuthContext)

  if (loading) return <div className="spinner" />
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin()) return <Navigate to="/" replace />

  return children
}

export default ProtectedRoute
