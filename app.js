const express = require("express");
const app = express();
const { getAllCategories } = require("./controller");

app.use(express.json());

app.get("/api/categories", getAllCategories);

module.exports = app;
