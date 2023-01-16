const db = require("./db/connection");

readCategories = () => {
  let queryString = `SELECT * FROM categories;`;
  return db
    .query(queryString)
    .then((results) => {
      return results.rows;
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = { readCategories };
