const { DatabaseError } = require("pg");
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

fetchReviewById = (review_id) => {
  return db
    .query(
      `SELECT 
    reviews.*, 
    CAST(COUNT(comments.review_id) AS int) AS comment_count
    FROM reviews 
    LEFT JOIN comments ON comments.review_id = reviews.review_id
    WHERE reviews.review_id = $1
    GROUP BY reviews.review_id`,
      [review_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "Page not found." });
      }
      return rows[0];
    });
};

fetchComments = (review_id) => {
  const dataBQuery = db.query(
    `SELECT * FROM comments
   WHERE comments.review_id = $1
   ORDER BY created_at DESC;`,
    [review_id]
  );
  return Promise.all([dataBQuery, fetchReviewById(review_id)]).then(
    (comments) => {
      return { comments: comments[0].rows };
    }
  );
};

const newComment = (review_id, username, body) => {
  if (!username || !body) {
    return Promise.reject({ status: 400, message: "Bad request." });
  }

  return db
    .query(
      `INSERT INTO comments (author, body, review_id)
  VALUES ($1, $2, $3)
  RETURNING *;
  `,
      [username, body, review_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "Path not found" });
      }
      return rows[0];
    });
};

module.exports = {
  readCategories,
  readReviews,
  fetchReviewById,
  fetchComments,
  newComment,
};
