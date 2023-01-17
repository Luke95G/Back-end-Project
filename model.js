const db = require("./db/connection");

readCategories = () => {
  let queryString = `SELECT * FROM categories;`;
  return db.query(queryString).then((results) => {
    return results.rows;
  });
};

readReviews = () => {
  let queryString = `SELECT reviews.* ,
  COUNT(reviews.review_id)
  AS comment_count 
  FROM reviews
  LEFT JOIN comments ON reviews.review_id = comments.review_id
  GROUP BY reviews.review_id
  ORDER BY created_at DESC; `;
  return db.query(queryString).then((results) => {
    return results.rows;
  });
};

module.exports = { readCategories, readReviews };
