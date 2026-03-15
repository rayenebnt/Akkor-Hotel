const request = require("supertest")
const mongoose = require("mongoose")
const User = require("../src/models/User")

const app = require("../src/app")

describe("User API", () => {

 beforeEach(async () => {
  await User.deleteMany({})
 })

 // =====================
 // REGISTER SUCCESS
 // =====================

 test("should register user", async () => {

  const res = await request(app)
   .post("/users/register")
   .send({
    email: "test@test.com",
    pseudo: "test",
    password: "123456"
   })

  expect(res.statusCode).toBe(201)
  expect(res.body.email).toBe("test@test.com")

 })

 // =====================
 // REGISTER INVALID EMAIL
 // =====================

 test("should fail register with invalid email", async () => {

  const res = await request(app)
   .post("/users/register")
   .send({
    email: "bademail",
    pseudo: "test",
    password: "123456"
   })

  expect(res.statusCode).toBe(400)

 })

 // =====================
 // REGISTER SHORT PASSWORD
 // =====================

 test("should fail register with short password", async () => {

  const res = await request(app)
   .post("/users/register")
   .send({
    email: "test@test.com",
    pseudo: "test",
    password: "12"
   })

  expect(res.statusCode).toBe(400)

 })

 // =====================
 // LOGIN SUCCESS
 // =====================

 test("should login user", async () => {

  await request(app)
   .post("/users/register")
   .send({
    email: "login@test.com",
    pseudo: "login",
    password: "123456"
   })

  const res = await request(app)
   .post("/users/login")
   .send({
    email: "login@test.com",
    password: "123456"
   })

  expect(res.statusCode).toBe(200)
  expect(res.body.token).toBeDefined()

 })

 // =====================
 // LOGIN WRONG PASSWORD
 // =====================

 test("should fail login with wrong password", async () => {

  await request(app)
   .post("/users/register")
   .send({
    email: "login@test.com",
    pseudo: "login",
    password: "123456"
   })

  const res = await request(app)
   .post("/users/login")
   .send({
    email: "login@test.com",
    password: "wrong"
   })

  expect(res.statusCode).toBe(401)

 })

 // =====================
 // LOGIN USER NOT FOUND
 // =====================

 test("should fail login if user does not exist", async () => {

  const res = await request(app)
   .post("/users/login")
   .send({
    email: "unknown@test.com",
    password: "123456"
   })

  expect(res.statusCode).toBe(404)

 })

})

afterAll(async () => {
 await mongoose.connection.close()
})