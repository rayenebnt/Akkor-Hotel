import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import Register from "../pages/Register"

const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return { ...actual, useNavigate: () => mockNavigate }
})

const renderRegister = (registerFn = vi.fn()) => {
  return render(
    <AuthContext.Provider value={{ register: registerFn }}>
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe("Register page", () => {
  beforeEach(() => mockNavigate.mockClear())

  it("renders all fields", () => {
    renderRegister()
    expect(screen.getByPlaceholderText(/email/i)).toBeTruthy()
    expect(screen.getByPlaceholderText(/pseudo/i)).toBeTruthy()
    expect(screen.getByPlaceholderText(/6 caractères/i)).toBeTruthy()
  })

  it("shows error when password is too short", async () => {
    renderRegister()

    await userEvent.type(screen.getByPlaceholderText(/email/i), "test@test.com")
    await userEvent.type(screen.getByPlaceholderText(/pseudo/i), "user")
    await userEvent.type(screen.getByPlaceholderText(/6 caractères/i), "12")
    await userEvent.click(screen.getByRole("button", { name: /créer/i }))

    expect(screen.getByText(/6 caractères/i)).toBeTruthy()
  })

  it("calls register and navigates on success", async () => {
    const register = vi.fn().mockResolvedValue({})
    renderRegister(register)

    await userEvent.type(screen.getByPlaceholderText(/email/i), "valid@test.com")
    await userEvent.type(screen.getByPlaceholderText(/pseudo/i), "validuser")
    await userEvent.type(screen.getByPlaceholderText(/6 caractères/i), "password123")
    await userEvent.click(screen.getByRole("button", { name: /créer/i }))

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith("valid@test.com", "validuser", "password123")
      expect(mockNavigate).toHaveBeenCalledWith("/login")
    })
  })

  it("shows error message when registration fails", async () => {
    const register = vi.fn().mockRejectedValue({
      response: { data: { message: "Email déjà utilisé" } }
    })
    renderRegister(register)

    await userEvent.type(screen.getByPlaceholderText(/email/i), "taken@test.com")
    await userEvent.type(screen.getByPlaceholderText(/pseudo/i), "user")
    await userEvent.type(screen.getByPlaceholderText(/6 caractères/i), "password123")
    await userEvent.click(screen.getByRole("button", { name: /créer/i }))

    await waitFor(() => {
      expect(screen.getByText("Email déjà utilisé")).toBeTruthy()
    })
  })
})
