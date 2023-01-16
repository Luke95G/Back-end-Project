const { devData } = require("./db/data/development-data/index");
const { readCategories } = require("./model");

const getAllCategories = (request, respsonse) => {
  readCategories().then((categories) => {
    respsonse.status(200).send({ categories });
  });
};

module.exports = { getAllCategories };
