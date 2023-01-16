const app = require("../app");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const data = require("../db/data/test-data");

afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(data);
});

describe.only("app", () => {
  describe(" GET /api/categories", () => {
    test("status: 200 and response code", () => {
      return request(app).get("/api/categories").expect(200);
    });
    test("status: 200 and return an array of objects with slug and description ", () => {
      return request(app)
        .get("/api/categories")
        .expect(200)
        .then((response) => {
          response.body.categories.forEach((category) => {
            expect(typeof category).toBe("object");
            expect(category.hasOwnProperty("slug")).toBe(true);
            expect(category.hasOwnProperty("description")).toBe(true);
          });
        });
    });
  });
});
