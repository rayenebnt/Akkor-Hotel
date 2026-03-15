const request = require("supertest")
const mongoose = require("mongoose")

const app = require("../src/app")

describe("Reservations API", () => {

 test("should block reservation without auth", async () => {

  const res = await request(app)
   .post("/reservations")
   .send({
    hotelId:"123",
    dateFrom:"2025-01-01",
    dateTo:"2025-01-05"
   })

  expect(res.statusCode).toBe(401)

 })

 test("should block getting reservations without token", async () => {

  const res = await request(app)
   .get("/reservations")

  expect(res.statusCode).toBe(401)

 })

})

afterAll(async () => {
 await mongoose.connection.close()
})