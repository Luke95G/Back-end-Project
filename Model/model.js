const fs = require("fs/promises");
const db = require("../db/connection");

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

newComment = (review_id, username, body) => {
  if (!username || !body) {
    return Promise.reject({ status: 400, msg: "Bad request." });
  }
  const queryString = `INSERT INTO comments (author, body, review_id) 
  VALUES ($1, $2, $3) 
  RETURNING *;`;
  return db.query(queryString, [username, body, review_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Path not found." });
    }
    return rows[0];
  });
};

updateReviewVote = (review_id, inc_votes) => {
  if (inc_votes === undefined) {
    return Promise.reject({ status: 400, message: "Bad request." });
  }
  const queryString = `UPDATE reviews 
  SET votes = votes + $1
  WHERE review_id = $2
   RETURNING *;`;
  return db.query(queryString, [inc_votes, review_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, message: "Not found." });
    }
    return rows[0];
  });
};

viewUsers = () => {
  let queryString = `SELECT * 
  FROM users;`;
  return db.query(queryString).then((response) => {
    return response.rows;
  });
};

arrangeReviews = (sort_by = "created_at", order = "DESC", category) => {
  let queryString = `SELECT reviews.*, 
  CAST(COUNT(comments.review_id) AS int)  
  AS comment_count
  FROM reviews
  LEFT JOIN comments 
  ON comments.review_id = reviews.review_id `;
  const queryArr = [];
  const columnArr = [
    "owner",
    "title",
    "designer",
    "review_img_url",
    "review_body",
    "category",
    "created_at",
    "votes",
  ];
  const categoryArr = [
    "euro game",
    "social deduction",
    "dexterity",
    "children's games",
  ];
  const orderedArr = ["asc", "desc", "ASC", "DESC"];
  if (category) {
    queryString += `WHERE category = $1`;
    queryArr.push(category);
  }
  if (!columnArr.includes(sort_by) || !orderedArr.includes(order)) {
    return Promise.reject({ status: 400, message: "Bad request." });
  }

  queryString += ` GROUP BY reviews.review_id
 ORDER BY reviews.${sort_by} ${order};`;
  return db.query(queryString, queryArr).then((response) => {
    if (response.rows.length === 0 && categoryArr.includes(category)) {
      return [];
    }
    if (response.rows.length === 0) {
      return Promise.reject({ status: 404, message: "Category not found." });
    }
    return response.rows;
  });
};

fetchReviewById = (review_id) => {
  const queryString = `SELECT reviews.*, 
  CAST (COUNT (comments.body) AS INT)comment_count  
  FROM reviews 
  LEFT JOIN comments
  ON reviews.review_id = comments.review_id
  WHERE reviews.review_id = $1
  GROUP BY reviews.review_id`;
  return db.query(queryString, [review_id]).then(({ rows, rowCount }) => {
    if (rowCount === 0) {
      return Promise.reject({ status: 404, message: "Page not found." });
    } else {
      return rows;
    }
  });
};

removeCommentById = (comment_id) => {
  const queryString = `DELETE FROM comments
  WHERE comment_id = $1
  RETURNING *;`;
  return db.query(queryString, [comment_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, message: "Path not found." });
    }
    return rows;
  });
};

readJson = () => {
  return fs
    .readFile("./endpoints.json", (err, data) => {
      if (err) {
        console.log(err);
      }

      return data;
    })
    .then((data) => {
      return data;
    });
};

module.exports = {
  readCategories,
  readReviews,
  fetchReviewById,
  fetchComments,
  newComment,
  updateReviewVote,
  viewUsers,
  arrangeReviews,
  fetchReviewById,
  removeCommentById,
  readJson,
};
