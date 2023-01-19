const express = require("express");
const app = express();
app.use(express.json());
const {
  getAllCategories,
  getAllReviews,
  getReviewById,
  getComments,
  postComment,
} = require("./controller");

app.get("/api/categories", getAllCategories);
app.get("/api/reviews", getAllReviews);
app.get("/api/reviews/:review_id", getReviewById);
app.get("/api/reviews/:review_id/comments", getComments);
app.post("/api/reviews/:review_id/comments", postComment);

app.all("/*", (request, response, next) => {
  response.status(404).send({ message: "Page not found." });
});

app.use((err, request, response, next) => {
  if (err.status === 400) {
    response.status(400).send({ message: "Bad request." });
  } else {
    next(err);
  }
});

app.use((err, request, response, next) => {
  if (err.code === "22P02") {
    response.status(400).send({ message: "Bad request." });
  } else {
    next(err);
  }
});

app.use((err, request, response, next) => {
  if (err.status && err.message) {
    response.status(err.status).send({ message: err.message });
  } else {
    next(err);
  }
});

module.exports = app;
