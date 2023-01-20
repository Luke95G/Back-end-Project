const app = require("../app");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const testData = require("../db/data/test-data");
const reviews = require("../db/data/development-data/reviews");
const { DatabaseError } = require("pg");

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
  test("should check that both keys and values are as expected", () => {
    return request(app)
      .get("/api/reviews")
      .then((result) => {
        const output = result.body.reviews;
        expect(output).toBeInstanceOf(Array);
        reviews.forEach((review) => {
          expect(review).toEqual(
            expect.objectContaining({
              title: expect.any(String),
              designer: expect.any(String),
              owner: expect.any(String),
              review_img_url: expect.any(String),
              review_body: expect.any(String),
              category: expect.any(String),
              created_at: expect.any(Date),
              votes: expect.any(Number),
            })
          );
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

describe("/api/reviews/:review_id", () => {
  test("should respond with a 200", () => {
    return request(app).get("/api/reviews/3").expect(200);
  });
  test("should respond with a review object by a review_id", () => {
    return request(app)
      .get("/api/reviews/3")
      .expect(200)
      .then(({ body }) => {
        expect(body.review).toBeInstanceOf(Object);
        expect(body.review).toEqual(
          expect.objectContaining({
            owner: expect.any(String),
            title: expect.any(String),
            review_id: expect.any(Number),
            designer: expect.any(String),
            review_img_url: expect.any(String),
            category: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            comment_count: expect.any(Number),
          })
        );
      });
  });
});
test("should respond with a 404 not found when given a path that doesnt exist", () => {
  return request(app)
    .get("/api/reviews/5555")
    .expect(404)
    .then(({ body }) => {
      expect(body.message).toBe("Page not found.");
    });
});
test("should respond with a 400 bad request when the review_id is not valid", () => {
  return request(app)
    .get("/api/reviews/bonjour")
    .expect(400)
    .then(({ body }) => {
      expect(body.message).toBe("Bad request.");
    });
});

describe("GET /api/reviews/:review_id/comments", () => {
  test("should return with a status 200", () => {
    return request(app).get("/api/reviews/2/comments").expect(200);
  });
  test("should return an array of objects for a given review_id with specific properties", () => {
    return request(app)
      .get("/api/reviews/3/comments")
      .expect(200)
      .then((result) => {
        const output = result.body.comments;
        expect(output.comments.length).toBe(3);
        expect(output.comments).toBeInstanceOf(Array);
        output.comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              body: expect.any(String),
              votes: expect.any(Number),
              author: expect.any(String),
              review_id: expect.any(Number),
              created_at: expect.any(String),
              comment_id: expect.any(Number),
            })
          );
        });
      });
  });
  test("should test to see if the order is most recent comments first", () => {
    return request(app)
      .get("/api/reviews/2/comments")
      .then((result) => {
        const output = result.body.comments.comments;
        expect(output).toBeSorted({ descending: true, key: "created_at" });
      });
  });
  test("should respond with a 404 not found when the review id doesnt exist on the db", () => {
    return request(app)
      .get("/api/reviews/9999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Page not found.");
      });
  });
  test("should respond with a 400 bad request when the path is not valid", () => {
    return request(app)
      .get("/api/reviews/sausages/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request.");
      });
  });
  test("should respond with an empty array when no comments are found", () => {
    return request(app)
      .get("/api/reviews/1/comments")
      .expect(200)
      .then(({ body }) => {
        const output = body.comments;
        expect(output).toEqual({ comments: [] });
      });
  });
});

describe("POST /api/reviews/:review_id/comments", () => {
  test("should return with a status 201 and test the reply object for the new comment", () => {
    const newComment = {
      username: "mallionaire",
      body: "Wooo we love gamez!",
    };
    return request(app)
      .post("/api/reviews/3/comments")
      .send(newComment)
      .expect(201)
      .then((response) => {
        const output = response.body.newComment;
        expect(output).toEqual(
          expect.objectContaining({
            body: expect.any(String),
            votes: expect.any(Number),
            author: expect.any(String),
            review_id: expect.any(Number),
            created_at: expect.any(String),
          })
        );
      });
  });
  test("status 400 and if no username field send back bad request error", () => {
    const newComment = {
      body: "thereIsNobodyHere",
    };
    return request(app)
      .post("/api/reviews/2/comments")
      .send(newComment)
      .expect(400)
      .then((response) => {
        const output = response.body.message;
        expect(output).toBe("Bad request.");
      });
  });
  test("status 400 and if review id is an invalid send back return bad request error", () => {
    const newComment = {
      username: "bainesface",
      body: "whosThatString",
    };
    return request(app)
      .post("/api/reviews/nothingToSeeHere/comments")
      .send(newComment)
      .expect(400)
      .then((response) => {
        const output = response.body.message;
        expect(output).toBe("Bad request.");
      });
  });
});
