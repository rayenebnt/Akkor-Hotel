const request  = require("supertest")
const mongoose = require("mongoose")
const app      = require("../src/app")
const User     = require("../src/models/User")
const Hotel    = require("../src/models/Hotel")
const bcrypt   = require("bcryptjs")

let adminToken
let userToken
let hotelId

const createAdmin = async () => {
  const hash = await bcrypt.hash("adminpass", 10)
  await User.create({ email: "admin@test.com", pseudo: "admin", password: hash, role: "admin" })
  const res = await request(app)
    .post("/users/login")
    .send({ email: "admin@test.com", password: "adminpass" })
  return res.body.token
}

const createUser = async () => {
  await request(app)
    .post("/users/register")
    .send({ email: "user@test.com", pseudo: "user", password: "userpass" })
  const res = await request(app)
    .post("/users/login")
    .send({ email: "user@test.com", password: "userpass" })
  return res.body.token
}

describe("Hotel API", () => {

  beforeEach(async () => {
    await User.deleteMany({})
    await Hotel.deleteMany({})
    adminToken = await createAdmin()
    userToken  = await createUser()
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  // ─── LIST ─────────────────────────────────────────────

  describe("GET /hotels", () => {

    it("devrait retourner la liste des hôtels sans authentification", async () => {
      const res = await request(app).get("/hotels")
      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })

    it("devrait respecter le paramètre limit", async () => {
      for (let i = 0; i < 5; i++) {
        await Hotel.create({ name: `Hotel ${i}`, location: "Paris" })
      }
      const res = await request(app).get("/hotels?limit=3")
      expect(res.statusCode).toBe(200)
      expect(res.body.length).toBeLessThanOrEqual(3)
    })

    it("devrait trier par nom par défaut", async () => {
      await Hotel.create({ name: "Zeus Hotel", location: "Paris" })
      await Hotel.create({ name: "Alpha Hotel", location: "Lyon" })
      const res = await request(app).get("/hotels")
      expect(res.statusCode).toBe(200)
      if (res.body.length >= 2) {
        expect(res.body[0].name.localeCompare(res.body[1].name)).toBeLessThanOrEqual(0)
      }
    })
  })

  // ─── GET BY ID ────────────────────────────────────────

  describe("GET /hotels/:id", () => {

    it("devrait retourner un hôtel par id sans authentification", async () => {
      const hotel = await Hotel.create({ name: "Test Hotel", location: "Paris" })
      const res = await request(app).get(`/hotels/${hotel._id}`)
      expect(res.statusCode).toBe(200)
      expect(res.body.name).toBe("Test Hotel")
    })

    it("devrait retourner 404 si l'hôtel n'existe pas", async () => {
      const fakeId = new mongoose.Types.ObjectId()
      const res = await request(app).get(`/hotels/${fakeId}`)
      expect(res.statusCode).toBe(404)
    })

    it("devrait retourner 400 pour un id invalide", async () => {
      const res = await request(app).get("/hotels/invalid-id")
      expect(res.statusCode).toBe(400)
    })
  })

  // ─── CREATE ───────────────────────────────────────────

  describe("POST /hotels", () => {

    it("un admin peut créer un hôtel", async () => {
      const res = await request(app)
        .post("/hotels")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "New Hotel", location: "Lyon", description: "Belle vue" })

      expect(res.statusCode).toBe(201)
      expect(res.body.name).toBe("New Hotel")
      expect(res.body._id).toBeDefined()
    })

    it("devrait refuser la création sans token", async () => {
      const res = await request(app)
        .post("/hotels")
        .send({ name: "Hotel", location: "Paris" })
      expect(res.statusCode).toBe(401)
    })

    it("un user normal NE PEUT PAS créer un hôtel", async () => {
      const res = await request(app)
        .post("/hotels")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Hotel", location: "Paris" })
      expect(res.statusCode).toBe(403)
    })

    it("devrait refuser si le nom est manquant", async () => {
      const res = await request(app)
        .post("/hotels")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ location: "Paris" })
      expect(res.statusCode).toBe(400)
    })

    it("devrait refuser si le lieu est manquant", async () => {
      const res = await request(app)
        .post("/hotels")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Hotel" })
      expect(res.statusCode).toBe(400)
    })
  })

  // ─── UPDATE ───────────────────────────────────────────

  describe("PUT /hotels/:id", () => {

    it("un admin peut modifier un hôtel", async () => {
      const hotel = await Hotel.create({ name: "Old Name", location: "Paris" })
      const res = await request(app)
        .put(`/hotels/${hotel._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "New Name" })

      expect(res.statusCode).toBe(200)
      expect(res.body.name).toBe("New Name")
    })

    it("un user normal NE PEUT PAS modifier un hôtel", async () => {
      const hotel = await Hotel.create({ name: "Hotel", location: "Paris" })
      const res = await request(app)
        .put(`/hotels/${hotel._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Hacked" })
      expect(res.statusCode).toBe(403)
    })
  })

  // ─── DELETE ───────────────────────────────────────────

  describe("DELETE /hotels/:id", () => {

    it("un admin peut supprimer un hôtel", async () => {
      const hotel = await Hotel.create({ name: "Del Hotel", location: "Paris" })
      const res = await request(app)
        .delete(`/hotels/${hotel._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
      expect(res.statusCode).toBe(200)
    })

    it("un user normal NE PEUT PAS supprimer un hôtel", async () => {
      const hotel = await Hotel.create({ name: "Hotel", location: "Paris" })
      const res = await request(app)
        .delete(`/hotels/${hotel._id}`)
        .set("Authorization", `Bearer ${userToken}`)
      expect(res.statusCode).toBe(403)
    })
  })
})
