const { devData } = require("./db/data/development-data/index");
const { readCategories, readReviews } = require("./model");

const getAllCategories = (request, respsonse) => {
  readCategories()
    .then((categories) => {
      respsonse.status(200).send({ categories });
    })
    .catch((err) => {
      console.log(err);
    });
};

const getAllReviews = (request, response) => {};

module.exports = { getAllCategories, getAllReviews };
