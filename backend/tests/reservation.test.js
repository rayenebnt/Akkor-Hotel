const request  = require("supertest")
const mongoose = require("mongoose")
const app      = require("../src/app")
const User     = require("../src/models/User")
const Hotel    = require("../src/models/Hotel")
const Reservation = require("../src/models/Reservation")
const bcrypt   = require("bcryptjs")

let adminToken, adminId
let user1Token, user1Id
let user2Token
let hotelId

beforeEach(async () => {
  await User.deleteMany({})
  await Hotel.deleteMany({})
  await Reservation.deleteMany({})

  // Create admin
  const hash = await bcrypt.hash("adminpass", 10)
  const admin = await User.create({ email: "admin@test.com", pseudo: "admin", password: hash, role: "admin" })
  adminId = admin._id.toString()
  const adminLogin = await request(app).post("/users/login").send({ email: "admin@test.com", password: "adminpass" })
  adminToken = adminLogin.body.token

  // Create user1
  const reg1 = await request(app).post("/users/register").send({ email: "u1@test.com", pseudo: "user1", password: "pass123" })
  user1Id = reg1.body._id
  const login1 = await request(app).post("/users/login").send({ email: "u1@test.com", password: "pass123" })
  user1Token = login1.body.token

  // Create user2
  await request(app).post("/users/register").send({ email: "u2@test.com", pseudo: "user2", password: "pass123" })
  const login2 = await request(app).post("/users/login").send({ email: "u2@test.com", password: "pass123" })
  user2Token = login2.body.token

  // Create hotel
  const hotel = await Hotel.create({ name: "Test Hotel", location: "Paris" })
  hotelId = hotel._id.toString()
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe("Reservation API", () => {

  // ─── CREATE ──────────────────────────────────────────

  describe("POST /reservations", () => {

    it("un user connecté peut créer une réservation", async () => {
      const res = await request(app)
        .post("/reservations")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ hotelId, dateFrom: "2026-06-01", dateTo: "2026-06-05" })

      expect(res.statusCode).toBe(201)
      expect(res.body.hotelId).toBeDefined()
      expect(res.body.userId).toBeDefined()
    })

    it("devrait refuser sans authentification", async () => {
      const res = await request(app)
        .post("/reservations")
        .send({ hotelId, dateFrom: "2026-06-01", dateTo: "2026-06-05" })
      expect(res.statusCode).toBe(401)
    })

    it("devrait refuser si dateFrom >= dateTo", async () => {
      const res = await request(app)
        .post("/reservations")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ hotelId, dateFrom: "2026-06-05", dateTo: "2026-06-01" })
      expect(res.statusCode).toBe(400)
    })

    it("devrait refuser si dateFrom === dateTo", async () => {
      const res = await request(app)
        .post("/reservations")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ hotelId, dateFrom: "2026-06-01", dateTo: "2026-06-01" })
      expect(res.statusCode).toBe(400)
    })

    it("devrait refuser si l'hôtel n'existe pas", async () => {
      const fakeId = new mongoose.Types.ObjectId()
      const res = await request(app)
        .post("/reservations")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ hotelId: fakeId, dateFrom: "2026-06-01", dateTo: "2026-06-05" })
      expect(res.statusCode).toBe(404)
    })

    it("devrait refuser si hotelId est manquant", async () => {
      const res = await request(app)
        .post("/reservations")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ dateFrom: "2026-06-01", dateTo: "2026-06-05" })
      expect(res.statusCode).toBe(400)
    })
  })

  // ─── GET ─────────────────────────────────────────────

  describe("GET /reservations", () => {

    it("un user voit uniquement ses propres réservations", async () => {
      await request(app)
        .post("/reservations")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ hotelId, dateFrom: "2026-06-01", dateTo: "2026-06-05" })

      await request(app)
        .post("/reservations")
        .set("Authorization", `Bearer ${user2Token}`)
        .send({ hotelId, dateFrom: "2026-07-01", dateTo: "2026-07-05" })

      const res = await request(app)
        .get("/reservations")
        .set("Authorization", `Bearer ${user1Token}`)

      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      // User1 should only see their own reservation
      res.body.forEach(r => {
        expect(r.userId.toString()).not.toBe(user2Token)
      })
    })

    it("devrait refuser sans authentification", async () => {
      const res = await request(app).get("/reservations")
      expect(res.statusCode).toBe(401)
    })
  })

  // ─── UPDATE ──────────────────────────────────────────

  describe("PUT /reservations/:id", () => {

    it("un user peut modifier sa propre réservation", async () => {
      const create = await request(app)
        .post("/reservations")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ hotelId, dateFrom: "2026-06-01", dateTo: "2026-06-05" })

      const res = await request(app)
        .put(`/reservations/${create.body._id}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ dateTo: "2026-06-10" })

      expect(res.statusCode).toBe(200)
      expect(new Date(res.body.dateTo).toISOString().slice(0, 10)).toBe("2026-06-10")
    })

    it("un user NE PEUT PAS modifier la réservation d'un autre", async () => {
      const create = await request(app)
        .post("/reservations")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ hotelId, dateFrom: "2026-06-01", dateTo: "2026-06-05" })

      const res = await request(app)
        .put(`/reservations/${create.body._id}`)
        .set("Authorization", `Bearer ${user2Token}`)
        .send({ dateTo: "2026-06-10" })

      expect(res.statusCode).toBe(403)
    })

    it("devrait refuser si les dates résultantes sont incohérentes", async () => {
      const create = await request(app)
        .post("/reservations")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ hotelId, dateFrom: "2026-06-01", dateTo: "2026-06-05" })

      const res = await request(app)
        .put(`/reservations/${create.body._id}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ dateTo: "2026-05-01" }) // before dateFrom

      expect(res.statusCode).toBe(400)
    })
  })

  // ─── DELETE ──────────────────────────────────────────

  describe("DELETE /reservations/:id", () => {

    it("un user peut supprimer sa propre réservation", async () => {
      const create = await request(app)
        .post("/reservations")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ hotelId, dateFrom: "2026-06-01", dateTo: "2026-06-05" })

      const res = await request(app)
        .delete(`/reservations/${create.body._id}`)
        .set("Authorization", `Bearer ${user1Token}`)

      expect(res.statusCode).toBe(200)
    })

    it("un user NE PEUT PAS supprimer la réservation d'un autre", async () => {
      const create = await request(app)
        .post("/reservations")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ hotelId, dateFrom: "2026-06-01", dateTo: "2026-06-05" })

      const res = await request(app)
        .delete(`/reservations/${create.body._id}`)
        .set("Authorization", `Bearer ${user2Token}`)

      expect(res.statusCode).toBe(403)
    })
  })

  // ─── ADMIN SEARCH ────────────────────────────────────

  describe("GET /reservations/search (admin)", () => {

    it("un admin peut chercher les réservations par email", async () => {
      await request(app)
        .post("/reservations")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ hotelId, dateFrom: "2026-06-01", dateTo: "2026-06-05" })

      const res = await request(app)
        .get("/reservations/search?email=u1@test.com")
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body.length).toBeGreaterThan(0)
    })

    it("un admin peut chercher par pseudo", async () => {
      await request(app)
        .post("/reservations")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ hotelId, dateFrom: "2026-06-01", dateTo: "2026-06-05" })

      const res = await request(app)
        .get("/reservations/search?pseudo=user1")
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.statusCode).toBe(200)
      expect(res.body.length).toBeGreaterThan(0)
    })

    it("devrait retourner 404 si l'utilisateur est introuvable", async () => {
      const res = await request(app)
        .get("/reservations/search?email=nobody@test.com")
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.statusCode).toBe(404)
    })

    it("un user normal NE PEUT PAS accéder à la recherche admin", async () => {
      const res = await request(app)
        .get("/reservations/search?email=u1@test.com")
        .set("Authorization", `Bearer ${user1Token}`)

      expect(res.statusCode).toBe(403)
    })

    it("devrait refuser sans token", async () => {
      const res = await request(app).get("/reservations/search?email=u1@test.com")
      expect(res.statusCode).toBe(401)
    })
  })
})
