/**
 * Tests E2E — Tunnel utilisateur principal
 * Simule un parcours complet : inscription → connexion → réservation → modification → suppression
 */
const request  = require("supertest")
const mongoose = require("mongoose")
const app      = require("../src/app")
const User     = require("../src/models/User")
const Hotel    = require("../src/models/Hotel")
const Reservation = require("../src/models/Reservation")
const bcrypt   = require("bcryptjs")

let token, userId, hotelId, reservationId, adminToken

beforeAll(async () => {
  await User.deleteMany({})
  await Hotel.deleteMany({})
  await Reservation.deleteMany({})

  // Seed admin + hotel
  const hash = await bcrypt.hash("adminpass", 10)
  await User.create({ email: "admin@e2e.com", pseudo: "admin", password: hash, role: "admin" })
  const adminLogin = await request(app).post("/users/login").send({ email: "admin@e2e.com", password: "adminpass" })
  adminToken = adminLogin.body.token

  const hotel = await Hotel.create({ name: "E2E Hotel", location: "Paris", description: "E2E test hotel" })
  hotelId = hotel._id.toString()
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe("E2E — Parcours utilisateur complet", () => {

  // ─── ÉTAPE 1 : Inscription ───────────────────────────

  test("1. Inscription avec email valide", async () => {
    const res = await request(app)
      .post("/users/register")
      .send({ email: "e2e@test.com", pseudo: "e2euser", password: "password123" })

    expect(res.statusCode).toBe(201)
    expect(res.body.email).toBe("e2e@test.com")
    expect(res.body.password).toBeUndefined() // sécurité
    userId = res.body._id
  })

  test("1b. Inscription avec email invalide → erreur 400", async () => {
    const res = await request(app)
      .post("/users/register")
      .send({ email: "pas-un-email", pseudo: "user", password: "password123" })

    expect(res.statusCode).toBe(400)
    expect(res.body.errors).toBeDefined()
  })

  test("1c. Inscription avec mot de passe trop court → erreur 400", async () => {
    const res = await request(app)
      .post("/users/register")
      .send({ email: "short@test.com", pseudo: "user", password: "12" })

    expect(res.statusCode).toBe(400)
  })

  test("1d. Inscription avec email déjà utilisé → erreur 409", async () => {
    const res = await request(app)
      .post("/users/register")
      .send({ email: "e2e@test.com", pseudo: "other", password: "password123" })

    expect(res.statusCode).toBe(409)
  })

  // ─── ÉTAPE 2 : Connexion ─────────────────────────────

  test("2. Connexion avec identifiants valides", async () => {
    const res = await request(app)
      .post("/users/login")
      .send({ email: "e2e@test.com", password: "password123" })

    expect(res.statusCode).toBe(200)
    expect(res.body.token).toBeDefined()
    token = res.body.token
  })

  test("2b. Connexion avec mauvais mot de passe → erreur 401", async () => {
    const res = await request(app)
      .post("/users/login")
      .send({ email: "e2e@test.com", password: "wrong" })

    expect(res.statusCode).toBe(401)
  })

  // ─── ÉTAPE 3 : Consulter les hôtels (anonyme) ────────

  test("3. Liste des hôtels accessible sans connexion", async () => {
    const res = await request(app).get("/hotels")
    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  test("3b. Détail d'un hôtel accessible sans connexion", async () => {
    const res = await request(app).get(`/hotels/${hotelId}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.name).toBe("E2E Hotel")
  })

  // ─── ÉTAPE 4 : Réservation ───────────────────────────

  test("4. Créer une réservation en étant connecté", async () => {
    const res = await request(app)
      .post("/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({ hotelId, dateFrom: "2026-08-01", dateTo: "2026-08-07" })

    expect(res.statusCode).toBe(201)
    expect(res.body._id).toBeDefined()
    reservationId = res.body._id
  })

  test("4b. Créer une réservation sans être connecté → erreur 401", async () => {
    const res = await request(app)
      .post("/reservations")
      .send({ hotelId, dateFrom: "2026-08-01", dateTo: "2026-08-07" })

    expect(res.statusCode).toBe(401)
  })

  test("4c. Créer une réservation avec des dates incohérentes → erreur 400", async () => {
    const res = await request(app)
      .post("/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({ hotelId, dateFrom: "2026-08-10", dateTo: "2026-08-01" })

    expect(res.statusCode).toBe(400)
  })

  // ─── ÉTAPE 5 : Consulter ses réservations ────────────

  test("5. Consulter ses réservations", async () => {
    const res = await request(app)
      .get("/reservations")
      .set("Authorization", `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThan(0)
  })

  // ─── ÉTAPE 6 : Modifier sa réservation ──────────────

  test("6. Modifier sa réservation", async () => {
    const res = await request(app)
      .put(`/reservations/${reservationId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ dateTo: "2026-08-14" })

    expect(res.statusCode).toBe(200)
    expect(new Date(res.body.dateTo).toISOString().slice(0, 10)).toBe("2026-08-14")
  })

  // ─── ÉTAPE 7 : Modifier son profil ───────────────────

  test("7. Modifier son pseudo", async () => {
    const res = await request(app)
      .put(`/users/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ pseudo: "newpseudo" })

    expect(res.statusCode).toBe(200)
    expect(res.body.pseudo).toBe("newpseudo")
    expect(res.body.password).toBeUndefined()
  })

  // ─── ÉTAPE 8 : Admin peut lire et chercher ───────────

  test("8. Admin peut chercher les réservations d'un user", async () => {
    const res = await request(app)
      .get("/reservations/search?email=e2e@test.com")
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThan(0)
  })

  // ─── ÉTAPE 9 : Supprimer sa réservation ─────────────

  test("9. Supprimer sa réservation", async () => {
    const res = await request(app)
      .delete(`/reservations/${reservationId}`)
      .set("Authorization", `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
  })

  // ─── ÉTAPE 10 : Supprimer son compte ─────────────────

  test("10. Supprimer son compte", async () => {
    const res = await request(app)
      .delete(`/users/${userId}`)
      .set("Authorization", `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
  })

  test("10b. Connexion après suppression → erreur 404", async () => {
    const res = await request(app)
      .post("/users/login")
      .send({ email: "e2e@test.com", password: "password123" })

    expect(res.statusCode).toBe(404)
  })
})
