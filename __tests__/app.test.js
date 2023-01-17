const app = require("../app");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const testData = require("../db/data/test-data");
const reviews = require("../db/data/development-data/reviews");

afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(testData);
});

describe("app", () => {
  describe(" GET /api/categories", () => {
    test("status: 200 and response code", () => {
      return request(app).get("/api/categories").expect(200);
    });
    test("status: 200 and return an array of objects with slug and description ", () => {
      return request(app)
        .get("/api/categories")
        .expect(200)
        .then((response) => {
          const input = response.body.categories.length;
          expect(input).toBe(4);
          response.body.categories.forEach((category) => {
            expect(typeof category).toBe("object");
            expect(category.hasOwnProperty("slug")).toBe(true);
            expect(category.hasOwnProperty("description")).toBe(true);
          });
        });
    });
  });
});
describe("api/reviews", () => {
  test("status: 200", () => {
    return request(app).get("/api/reviews").expect(200);
  });
  test("responds with an array full of reviews with correct categories", () => {
    return request(app)
      .get("/api/reviews")
      .then((result) => {
        const output = result.body.reviews;
        expect(output).toHaveLength(13);
        output.forEach((review) => {
          expect(review).toHaveProperty("title");
          expect(review).toHaveProperty("designer");
          expect(review).toHaveProperty("owner");
          expect(review).toHaveProperty("review_img_url");
          expect(review).toHaveProperty("review_body");
          expect(review).toHaveProperty("category");
          expect(review).toHaveProperty("created_at");
          expect(review).toHaveProperty("votes");
          expect(review).toHaveProperty("comment_count");
        });
      });
  });
  test("should return the dates in descending order", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then((result) => {
        const input = result.body.reviews;
        expect(input).toBeSorted("created_at", {
          descending: true,
        });
      });
  });
});
