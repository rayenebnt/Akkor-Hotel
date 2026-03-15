const request = require("supertest")
const mongoose = require("mongoose")

const app = require("../src/app")

describe("Hotels API", () => {

 test("should get list of hotels", async () => {

  const res = await request(app)
   .get("/hotels")

  expect(res.statusCode).toBe(200)

 })

 test("should support limit parameter", async () => {

  const res = await request(app)
   .get("/hotels?limit=5")

  expect(res.statusCode).toBe(200)

 })

 test("should fail creating hotel without token", async () => {

  const res = await request(app)
   .post("/hotels")
   .send({
    name:"Test Hotel",
    location:"Paris"
   })

  expect(res.statusCode).toBe(401)

 })

})

afterAll(async () => {
 await mongoose.connection.close()
})