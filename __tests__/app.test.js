const app = require("../app");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const testData = require("../db/data/test-data");
const reviews = require("../db/data/development-data/reviews");
const { DatabaseError } = require("pg");
const { response } = require("../app");
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

describe("PATCH /api/reviews/:review_id", () => {
  test("should have status 200 and increases the vote key when given an increased vote ", () => {
    const newVoteToUpdate = { inc_votes: 5 };
    return request(app)
      .patch("/api/reviews/1")
      .send(newVoteToUpdate)
      .expect(200)
      .then((response) => {
        const output = response.body.review;
        const expected = {
          review_id: 1,
          title: "Agricola",
          category: "euro game",
          designer: "Uwe Rosenberg",
          owner: "mallionaire",
          review_body: "Farmyard fun!",
          review_img_url:
            "https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=700&h=700",
          created_at: "2021-01-18T10:00:20.514Z",
          votes: 6,
        };
        expect(output).toEqual(expected);
      });
  });
  test("should have status 200 and decrease the vote key when given a decreased vote", () => {
    const newVoteToUpdate = { inc_votes: -4 };
    return request(app)
      .patch("/api/reviews/5")
      .send(newVoteToUpdate)
      .expect(200)
      .then((response) => {
        const output = response.body.review;
        const expected = {
          review_id: 5,
          title: "Proident tempor et.",
          category: "social deduction",
          designer: "Seymour Buttz",
          owner: "mallionaire",
          review_body:
            "Labore occaecat sunt qui commodo anim anim aliqua adipisicing aliquip fugiat. Ad in ipsum incididunt esse amet deserunt aliqua exercitation occaecat nostrud irure labore ipsum. Culpa tempor non voluptate reprehenderit deserunt pariatur cupidatat aliqua adipisicing. Nostrud labore dolor fugiat sint consequat excepteur dolore irure eu. Anim ex adipisicing magna deserunt enim fugiat do nulla officia sint. Ex tempor ut aliquip exercitation eiusmod. Excepteur deserunt officia voluptate sunt aliqua esse deserunt velit. In id non proident veniam ipsum id in consequat duis ipsum et incididunt. Qui cupidatat ea deserunt magna proident nisi nulla eiusmod aliquip magna deserunt fugiat fugiat incididunt. Laboris nisi velit mollit ullamco deserunt eiusmod deserunt ea dolore veniam.",
          review_img_url:
            "https://images.pexels.com/photos/209728/pexels-photo-209728.jpeg?w=700&h=700",
          created_at: "2021-01-07T09:06:08.077Z",
          votes: 1,
        };
        expect(output).toEqual(expected);
      });
  });
  test("should give status 404 when the review id is valid but in non-existant", () => {
    const newVoteToUpdate = { inc_votes: 10 };
    return request(app)
      .patch("/api/reviews/123456789")
      .send(newVoteToUpdate)
      .expect(404)
      .then((response) => {
        const output = response.body.message;
        const expected = "Not found.";
        expect(output).toBe(expected);
      });
  });
  test("should  give status 400 when the data type passed into the inc votes is invalid", () => {
    const newVoteToUpdate = { inc_votes: "Will I work?" };
    return request(app)
      .patch("/api/reviews/5")
      .send(newVoteToUpdate)
      .expect(400)
      .then((response) => {
        const output = response.body.message;
        const expected = "Bad request.";
        expect(output).toBe(expected);
      });
  });
  test("should give status 400 when the review id is not valid", () => {
    const newVoteToUpdate = { inc_votes: -12 };
    return request(app)
      .patch("/api/reviews/shouldntWork")
      .send(newVoteToUpdate)
      .expect(400)
      .then((response) => {
        const output = response.body.message;
        const expected = "Bad request.";
        expect(output).toBe(expected);
      });
  });
});

describe("GET /api/users", () => {
  test("should have status 200 and return all usernames from the users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        const output = response.body.users;
        expect(output).toBeInstanceOf(Array);
        expect(output[0].username).toBe("mallionaire");
        expect(output[1].username).toBe("philippaclaire9");
        expect(output[2].username).toBe("bainesface");
      });
  });
});

describe("GET /api/reviews", () => {
  test("should give status 200 and return with an array of objects with owner, title, review id, category, review img url, created at, votes and designer", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then((response) => {
        const output = response.body.reviews;
        expect(output).toBeInstanceOf(Array);
        output.forEach((review) => {
          expect(review).toEqual(
            expect.objectContaining({
              owner: expect.any(String),
              title: expect.any(String),
              review_id: expect.any(Number),
              category: expect.any(String),
              review_img_url: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
            })
          );
        });
      });
  });
  test("should return the total count of all the comments with a review id", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then((response) => {
        const output = response.body.reviews;
        output.forEach((review) => {
          expect(review.hasOwnProperty("comment_count")).toBe(true);
        });
      });
  });
  test("should return in date descending order", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then((response) => {
        const output = response.body.reviews;
        expect(output).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("should take a sort by query, which then sorts by title", () => {
    return request(app)
      .get("/api/reviews?sort_by=title")
      .expect(200)
      .then((response) => {
        const output = response.body.reviews;
        expect(output).toBeSortedBy("title", {
          descending: true,
          coerce: true,
        });
      });
  });
  test("should take a query and return the query in default order, date and descending", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then((response) => {
        const output = response.body.reviews;
        expect(output).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("should accept a category and then return the games in that category", () => {
    return request(app)
      .get("/api/reviews/?category=social+deduction")
      .expect(200)
      .then((response) => {
        const output = response.body.reviews;
        expect(output).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("accept a valid category but when no reviews are there, return empty array", () => {
    return request(app)
      .get(`/api/reviews/?category=children's+games`)
      .expect(200)
      .then((response) => {
        const output = response.body.reviews;
        expect(output).toEqual([]);
      });
  });
  test("return reviews ordered by title in asc order", () => {
    return request(app)
      .get(`/api/reviews/?sort_by=designer&&order=asc`)
      .expect(200)
      .then((response) => {
        const output = response.body.reviews;
        expect(output).toBeSortedBy("designer", { descending: false });
      });
  });
  test("testing for a 404 when a category column isnt valid", () => {
    return request(app)
      .get(`/api/reviews/?category=nothing`)
      .expect(404)
      .then((response) => {
        const output = response.body.message;
        expect(output).toBe("Category not found.");
      });
  });
  test("should give status 400, when entered non-valid sort by query", () => {
    return request(app)
      .get("/api/reviews/?sort_by=badrequest")
      .expect(400)
      .then((response) => {
        const output = response.body.message;
        expect(output).toBe("Bad request.");
      });
  });
  test("should give status 400 when order query isnt valid", () => {
    return request(app)
      .get(`/api/reviews/?sort_by=title&&order=phone`)
      .expect(400)
      .then((response) => {
        const output = response.body.message;
        expect(output).toBe("Bad request.");
      });
  });
});
