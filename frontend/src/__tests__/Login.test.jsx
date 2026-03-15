import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import Login from "../pages/Login"

const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return { ...actual, useNavigate: () => mockNavigate }
})

const renderLogin = (loginFn = vi.fn()) => {
  return render(
    <AuthContext.Provider value={{ login: loginFn }}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe("Login page", () => {
  beforeEach(() => mockNavigate.mockClear())

  it("renders email and password fields", () => {
    renderLogin()
    expect(screen.getByPlaceholderText(/email/i)).toBeTruthy()
    expect(screen.getByPlaceholderText(/••••/)).toBeTruthy()
  })

  it("calls login and redirects on success", async () => {
    const login = vi.fn().mockResolvedValue({})
    renderLogin(login)

    await userEvent.type(screen.getByPlaceholderText(/email/i), "test@test.com")
    await userEvent.type(screen.getByPlaceholderText(/••••/), "password")
    await userEvent.click(screen.getByRole("button", { name: /se connecter/i }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith("test@test.com", "password")
      expect(mockNavigate).toHaveBeenCalledWith("/")
    })
  })

  it("shows error message on failed login", async () => {
    const login = vi.fn().mockRejectedValue({
      response: { data: { message: "Invalid password" } }
    })
    renderLogin(login)

    await userEvent.type(screen.getByPlaceholderText(/email/i), "test@test.com")
    await userEvent.type(screen.getByPlaceholderText(/••••/), "wrong")
    await userEvent.click(screen.getByRole("button", { name: /se connecter/i }))

    await waitFor(() => {
      expect(screen.getByText("Invalid password")).toBeTruthy()
    })
  })

  it("shows generic error when no message from API", async () => {
    const login = vi.fn().mockRejectedValue({ response: null })
    renderLogin(login)

    await userEvent.type(screen.getByPlaceholderText(/email/i), "test@test.com")
    await userEvent.type(screen.getByPlaceholderText(/••••/), "wrong")
    await userEvent.click(screen.getByRole("button", { name: /se connecter/i }))

    await waitFor(() => {
      expect(screen.getByText(/identifiants invalides/i)).toBeTruthy()
    })
  })
})
