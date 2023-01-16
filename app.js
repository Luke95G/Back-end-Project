const express = require("express");
const app = express();
const { getAllCategories, getAllReviews } = require("./controller");

app.get("/api/categories", getAllCategories);
app.get("/api/reviews", getAllReviews);

module.exports = app;
