import { BrowserRouter, Routes, Route } from "react-router-dom"

import Hotels from "./pages/Hotels"
import Login from "./pages/Login"
import Register from "./pages/Register"
import HotelDetails from "./pages/HotelDetails"
import Reservations from "./pages/Reservations"
import Profile from "./pages/Profile"
import AdminHotels from "./pages/AdminHotels"

import Navbar from "./components/Navbar"
import { ProtectedRoute, AdminRoute } from "./routes/ProtectedRoute"
import { AuthProvider } from "./context/AuthContext"

import "./index.css"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Hotels />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/hotels/:id" element={<HotelDetails />} />

          <Route path="/reservations" element={
            <ProtectedRoute><Reservations /></ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          <Route path="/admin" element={
            <AdminRoute><AdminHotels /></AdminRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
