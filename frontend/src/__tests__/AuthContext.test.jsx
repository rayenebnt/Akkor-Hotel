import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AuthProvider, AuthContext } from "../context/AuthContext"
import { useContext } from "react"

// Mock axios and jwt-decode
vi.mock("../api/axios", () => ({
  default: {
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() } }
  }
}))

vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(() => ({
    id: "user123",
    role: "user",
    exp: Math.floor(Date.now() / 1000) + 3600
  }))
}))

import api from "../api/axios"
import { jwtDecode } from "jwt-decode"

const TestConsumer = () => {
  const { user, login, logout, isAdmin } = useContext(AuthContext)
  return (
    <div>
      <span data-testid="user">{user ? JSON.stringify(user) : "null"}</span>
      <span data-testid="is-admin">{isAdmin() ? "yes" : "no"}</span>
      <button onClick={() => login("test@test.com", "pass")}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it("starts with null user", () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    expect(screen.getByTestId("user").textContent).toBe("null")
  })

  it("logs in and sets user from token", async () => {
    api.post.mockResolvedValue({ data: { token: "fake.jwt.token" } })

    render(<AuthProvider><TestConsumer /></AuthProvider>)
    await userEvent.click(screen.getByText("Login"))

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toContain("user123")
    })
    expect(localStorage.getItem("token")).toBe("fake.jwt.token")
  })

  it("logs out and clears user", async () => {
    api.post.mockResolvedValue({ data: { token: "fake.jwt.token" } })

    render(<AuthProvider><TestConsumer /></AuthProvider>)
    await userEvent.click(screen.getByText("Login"))
    await waitFor(() => expect(screen.getByTestId("user").textContent).toContain("user123"))

    await userEvent.click(screen.getByText("Logout"))
    expect(screen.getByTestId("user").textContent).toBe("null")
    expect(localStorage.getItem("token")).toBeNull()
  })

  it("restores session from localStorage on mount", async () => {
    localStorage.setItem("token", "existing.jwt.token")

    render(<AuthProvider><TestConsumer /></AuthProvider>)

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toContain("user123")
    })
  })

  it("detects admin role correctly", async () => {
    jwtDecode.mockReturnValue({
      id: "admin1",
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + 3600
    })
    api.post.mockResolvedValue({ data: { token: "admin.jwt.token" } })

    render(<AuthProvider><TestConsumer /></AuthProvider>)
    await userEvent.click(screen.getByText("Login"))

    await waitFor(() => expect(screen.getByTestId("is-admin").textContent).toBe("yes"))
  })

  it("removes expired token from localStorage", () => {
    jwtDecode.mockReturnValue({
      id: "user123",
      role: "user",
      exp: Math.floor(Date.now() / 1000) - 100 // expired
    })
    localStorage.setItem("token", "expired.token")

    render(<AuthProvider><TestConsumer /></AuthProvider>)

    expect(localStorage.getItem("token")).toBeNull()
  })
})
