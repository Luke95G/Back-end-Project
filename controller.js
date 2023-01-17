const { devData } = require("./db/data/development-data/index");
const { readCategories, readReviews } = require("./model");

const getAllCategories = (request, respsonse, next) => {
  readCategories()
    .then((categories) => {
      respsonse.status(200).send({ categories });
    })
    .catch(next);
};

const getAllReviews = (request, response, next) => {
  readReviews()
    .then((reviews) => {
      response.status(200).send({ reviews });
    })
    .catch(next);
};

module.exports = { getAllCategories, getAllReviews };
