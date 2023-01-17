const express = require("express");
const app = express();
const {
  getAllCategories,
  getAllReviews,
  getReviewById,
} = require("./controller");

app.get("/api/categories", getAllCategories);
app.get("/api/reviews", getAllReviews);
// app.get("/api/reviews/:review_id", getReviewById);

module.exports = app;
