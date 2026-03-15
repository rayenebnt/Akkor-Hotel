const request = require("supertest")
const mongoose = require("mongoose")

const app = require("../src/app")

const User = require("../src/models/User")
const Hotel = require("../src/models/Hotel")
const Reservation = require("../src/models/Reservation")

describe("E2E User Flow", () => {

 let token
 let hotelId

 // ======================
 // CLEAN DATABASE BEFORE EACH TEST
 // ======================

 beforeEach(async () => {

  await User.deleteMany({})
  await Hotel.deleteMany({})
  await Reservation.deleteMany({})

  const hotel = await Hotel.create({
   name: "Test Hotel",
   location: "Paris",
   description: "E2E test hotel",
   picture_list: []
  })

  hotelId = hotel._id

 })

 // ======================
 // REGISTER USER
 // ======================

 test("register user", async () => {

  const res = await request(app)
   .post("/users/register")
   .send({
    email: "e2e@test.com",
    pseudo: "e2e",
    password: "123456"
   })

  expect(res.statusCode).toBe(201)

 })

 // ======================
 // LOGIN USER
 // ======================

 test("login user", async () => {

  await request(app)
   .post("/users/register")
   .send({
    email: "e2e@test.com",
    pseudo: "e2e",
    password: "123456"
   })

  const res = await request(app)
   .post("/users/login")
   .send({
    email: "e2e@test.com",
    password: "123456"
   })

  token = res.body.token

  expect(res.statusCode).toBe(200)
  expect(token).toBeDefined()

 })

 // ======================
 // CREATE RESERVATION
 // ======================

 test("create reservation", async () => {

  await request(app)
   .post("/users/register")
   .send({
    email: "e2e@test.com",
    pseudo: "e2e",
    password: "123456"
   })

  const login = await request(app)
   .post("/users/login")
   .send({
    email: "e2e@test.com",
    password: "123456"
   })

  token = login.body.token

  const res = await request(app)
   .post("/reservations")
   .set("Authorization", `Bearer ${token}`)
   .send({
    hotelId: hotelId,
    dateFrom: "2025-01-01",
    dateTo: "2025-01-05"
   })

  expect(res.statusCode).toBe(201)

 })

 // ======================
 // GET USER RESERVATIONS
 // ======================

 test("get reservations", async () => {

  await request(app)
   .post("/users/register")
   .send({
    email: "e2e@test.com",
    pseudo: "e2e",
    password: "123456"
   })

  const login = await request(app)
   .post("/users/login")
   .send({
    email: "e2e@test.com",
    password: "123456"
   })

  token = login.body.token

  await request(app)
   .post("/reservations")
   .set("Authorization", `Bearer ${token}`)
   .send({
    hotelId: hotelId,
    dateFrom: "2025-01-01",
    dateTo: "2025-01-05"
   })

  const res = await request(app)
   .get("/reservations")
   .set("Authorization", `Bearer ${token}`)

  expect(res.statusCode).toBe(200)
  expect(Array.isArray(res.body)).toBe(true)

 })

})

afterAll(async () => {
 await mongoose.connection.close()
})