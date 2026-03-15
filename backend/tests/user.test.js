const request  = require("supertest")
const mongoose = require("mongoose")
const app      = require("../src/app")
const User     = require("../src/models/User")

describe("User API", () => {

  beforeEach(async () => {
    await User.deleteMany({})
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  // ─── REGISTER ────────────────────────────────────────

  describe("POST /users/register", () => {

    it("devrait créer un utilisateur valide", async () => {
      const res = await request(app)
        .post("/users/register")
        .send({ email: "test@test.com", pseudo: "testuser", password: "123456" })

      expect(res.statusCode).toBe(201)
      expect(res.body.email).toBe("test@test.com")
      expect(res.body.pseudo).toBe("testuser")
      expect(res.body.role).toBe("user")
      expect(res.body.password).toBeUndefined()
    })

    it("devrait refuser un email invalide", async () => {
      const res = await request(app)
        .post("/users/register")
        .send({ email: "bademail", pseudo: "user", password: "123456" })

      expect(res.statusCode).toBe(400)
      expect(res.body.errors).toBeDefined()
    })

    it("devrait refuser un mot de passe trop court (< 6 chars)", async () => {
      const res = await request(app)
        .post("/users/register")
        .send({ email: "test@test.com", pseudo: "user", password: "12" })

      expect(res.statusCode).toBe(400)
    })

    it("devrait refuser un pseudo trop court (< 3 chars)", async () => {
      const res = await request(app)
        .post("/users/register")
        .send({ email: "test@test.com", pseudo: "ab", password: "123456" })

      expect(res.statusCode).toBe(400)
    })

    it("devrait refuser un email déjà utilisé", async () => {
      await request(app)
        .post("/users/register")
        .send({ email: "dup@test.com", pseudo: "user1", password: "123456" })

      const res = await request(app)
        .post("/users/register")
        .send({ email: "dup@test.com", pseudo: "user2", password: "123456" })

      expect(res.statusCode).toBe(409)
    })

    it("ne doit pas permettre à un utilisateur de s'auto-assigner le rôle admin", async () => {
      const res = await request(app)
        .post("/users/register")
        .send({ email: "hacker@test.com", pseudo: "hacker", password: "123456", role: "admin" })

      expect(res.statusCode).toBe(201)
      expect(res.body.role).toBe("user")
    })

    it("devrait refuser si les champs requis sont manquants", async () => {
      const res = await request(app)
        .post("/users/register")
        .send({ email: "test@test.com" })

      expect(res.statusCode).toBe(400)
    })
  })

  // ─── LOGIN ───────────────────────────────────────────

  describe("POST /users/login", () => {

    beforeEach(async () => {
      await request(app)
        .post("/users/register")
        .send({ email: "login@test.com", pseudo: "loginuser", password: "123456" })
    })

    it("devrait retourner un token JWT valide", async () => {
      const res = await request(app)
        .post("/users/login")
        .send({ email: "login@test.com", password: "123456" })

      expect(res.statusCode).toBe(200)
      expect(res.body.token).toBeDefined()
      expect(res.body.userId).toBeDefined()
    })

    it("devrait refuser avec un mauvais mot de passe", async () => {
      const res = await request(app)
        .post("/users/login")
        .send({ email: "login@test.com", password: "wrong" })

      expect(res.statusCode).toBe(401)
    })

    it("devrait refuser si l'utilisateur n'existe pas", async () => {
      const res = await request(app)
        .post("/users/login")
        .send({ email: "unknown@test.com", password: "123456" })

      expect(res.statusCode).toBe(404)
    })

    it("devrait refuser si l'email est manquant", async () => {
      const res = await request(app)
        .post("/users/login")
        .send({ password: "123456" })

      expect(res.statusCode).toBe(400)
    })
  })

  // ─── GET USER ────────────────────────────────────────

  describe("GET /users/:id", () => {

    it("un user peut lire son propre profil", async () => {
      const reg = await request(app)
        .post("/users/register")
        .send({ email: "me@test.com", pseudo: "meuser", password: "123456" })

      const login = await request(app)
        .post("/users/login")
        .send({ email: "me@test.com", password: "123456" })

      const token = login.body.token
      const userId = reg.body._id

      const res = await request(app)
        .get(`/users/${userId}`)
        .set("Authorization", `Bearer ${token}`)

      expect(res.statusCode).toBe(200)
      expect(res.body.email).toBe("me@test.com")
      expect(res.body.password).toBeUndefined()
    })

    it("un user NE PEUT PAS lire le profil d'un autre user", async () => {
      const reg1 = await request(app)
        .post("/users/register")
        .send({ email: "user1@test.com", pseudo: "user1", password: "123456" })

      await request(app)
        .post("/users/register")
        .send({ email: "user2@test.com", pseudo: "user2", password: "123456" })

      const login = await request(app)
        .post("/users/login")
        .send({ email: "user2@test.com", password: "123456" })

      const res = await request(app)
        .get(`/users/${reg1.body._id}`)
        .set("Authorization", `Bearer ${login.body.token}`)

      expect(res.statusCode).toBe(403)
    })

    it("devrait refuser sans token", async () => {
      const res = await request(app).get("/users/someid")
      expect(res.statusCode).toBe(401)
    })
  })

  // ─── UPDATE USER ─────────────────────────────────────

  describe("PUT /users/:id", () => {

    it("un user peut modifier son propre profil", async () => {
      const reg = await request(app)
        .post("/users/register")
        .send({ email: "upd@test.com", pseudo: "upduser", password: "123456" })

      const login = await request(app)
        .post("/users/login")
        .send({ email: "upd@test.com", password: "123456" })

      const res = await request(app)
        .put(`/users/${reg.body._id}`)
        .set("Authorization", `Bearer ${login.body.token}`)
        .send({ pseudo: "newpseudo" })

      expect(res.statusCode).toBe(200)
      expect(res.body.pseudo).toBe("newpseudo")
      expect(res.body.password).toBeUndefined()
    })

    it("un user NE PEUT PAS modifier un autre utilisateur", async () => {
      const reg1 = await request(app)
        .post("/users/register")
        .send({ email: "victim@test.com", pseudo: "victim", password: "123456" })

      await request(app)
        .post("/users/register")
        .send({ email: "attacker@test.com", pseudo: "attacker", password: "123456" })

      const login = await request(app)
        .post("/users/login")
        .send({ email: "attacker@test.com", password: "123456" })

      const res = await request(app)
        .put(`/users/${reg1.body._id}`)
        .set("Authorization", `Bearer ${login.body.token}`)
        .send({ pseudo: "hacked" })

      expect(res.statusCode).toBe(403)
    })

    it("un user NE PEUT PAS modifier son rôle", async () => {
      const reg = await request(app)
        .post("/users/register")
        .send({ email: "norole@test.com", pseudo: "norole", password: "123456" })

      const login = await request(app)
        .post("/users/login")
        .send({ email: "norole@test.com", password: "123456" })

      const res = await request(app)
        .put(`/users/${reg.body._id}`)
        .set("Authorization", `Bearer ${login.body.token}`)
        .send({ role: "admin" })

      const check = await request(app)
        .get(`/users/${reg.body._id}`)
        .set("Authorization", `Bearer ${login.body.token}`)

      expect(check.body.role).toBe("user")
    })
  })

  // ─── DELETE USER ─────────────────────────────────────

  describe("DELETE /users/:id", () => {

    it("un user peut supprimer son propre compte", async () => {
      const reg = await request(app)
        .post("/users/register")
        .send({ email: "del@test.com", pseudo: "deluser", password: "123456" })

      const login = await request(app)
        .post("/users/login")
        .send({ email: "del@test.com", password: "123456" })

      const res = await request(app)
        .delete(`/users/${reg.body._id}`)
        .set("Authorization", `Bearer ${login.body.token}`)

      expect(res.statusCode).toBe(200)
    })

    it("un user NE PEUT PAS supprimer un autre compte", async () => {
      const reg1 = await request(app)
        .post("/users/register")
        .send({ email: "target@test.com", pseudo: "target", password: "123456" })

      await request(app)
        .post("/users/register")
        .send({ email: "deleter@test.com", pseudo: "deleter", password: "123456" })

      const login = await request(app)
        .post("/users/login")
        .send({ email: "deleter@test.com", password: "123456" })

      const res = await request(app)
        .delete(`/users/${reg1.body._id}`)
        .set("Authorization", `Bearer ${login.body.token}`)

      expect(res.statusCode).toBe(403)
    })
  })
})