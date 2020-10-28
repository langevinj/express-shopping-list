process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
let items = require("../fakeDb");
// const fs = require("fs")

// let items = [];

// fs.readFile('./myDb.json', 'utf8', function (err, data) {
//     if (err) {
//         console.error(err);
//         process.exit(1);
//     }
//     items.push(JSON.parse(data))
// })

let cheeseburger = { name: "cheeseburger", price: 4.99 };

beforeEach(function() {
    items.push(cheeseburger);
});

afterEach(function() {
    items.length = 0;
});

describe("GET /items", () => { 
  test("Get a list of items", async () => {
    const resp = await request(app).get("/items");
    expect(resp.statusCode).toBe(200);

    expect(resp.body).toEqual({items: [cheeseburger]})
    });
});

describe("GET /items/:name", () => {
    test("Get an item by specifying its name", async () => {
        const resp = await request(app).get("/items/cheeseburger")
        expect(resp.statusCode).toBe(200)

        expect(resp.body).toEqual({item: cheeseburger})
    })
    test("Responds with 404 for invalid item name", async() => {
        const resp = await request(app).get('/items/macandcheese')
        expect(resp.statusCode).toBe(404)
    })
})

describe("POST /items", () => {
    test("Add an item to list of items", async () => {
        const resp = await request(app).post("/items").send({ name: "Lo Mein", price: 3.49})
        expect(resp.statusCode).toBe(201)

        expect(resp.body).toEqual({ item: {"name": "Lo Mein", "price": 3.49}})
    })
    test("Responds with 400 if name left blank", async () => {
        const resp = await request(app).post("/items").send({price: 5.00})
        expect(resp.statusCode).toBe(400)
        expect(resp.body).toEqual({"error": "Name is required"})
    })
    test("Responds with 400 if price left blank", async () => {
        const resp = await request(app).post("/items").send({ name: "Sausage" })
        expect(resp.statusCode).toBe(400)
        expect(resp.body).toEqual({ "error": "Price is required" })
    })
})

describe("PATCH /items/:name", () => {
    test("Edit an item", async () => {
        const resp = await request(app).patch("/items/cheeseburger").send({ name: "Hamburger", price: 3.00 })
        expect(resp.statusCode).toBe(200)

        expect(resp.body).toEqual({ item: {"name": "Hamburger", "price": 3.00} })
    })
    test("Expect 404 if item name is not in list", async () => {
        const resp = await request(app).patch("/items/cereal").send({ name: "Hamburger", price: 3.00 })
        expect(resp.statusCode).toBe(404)

        expect(resp.body).toEqual({"error": "Item not found"})
    })
})

describe("DELETE /items/:name", () => {
    test("Delete an item from the list", async () => {
        const resp = await request(app).delete(`/items/${cheeseburger.name}`)
        expect(resp.statusCode).toBe(200)

        expect(resp.body).toEqual({ message: "Deleted" })
    })
    test("Expect 404 if item is not in db", async () => {
        const resp = await request(app).delete(`/items/tacos`)
        expect(resp.statusCode).toBe(404)

        expect(resp.body).toEqual({ "error": "Item not found" })
    })
})