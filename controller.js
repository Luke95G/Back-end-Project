const { devData } = require("./db/data/development-data/index");
const {
  readCategories,
  readReviews,
  fetchReviewById,
  fetchComments,
  newComment,
} = require("./model");

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

const getReviewById = (request, response, next) => {
  const { review_id } = request.params;
  fetchReviewById(review_id)
    .then((review) => {
      response.status(200).send({ review });
    })
    .catch(next);
};

const getComments = (request, response, next) => {
  const { review_id } = request.params;
  fetchComments(review_id)
    .then((comments) => {
      response.status(200).send({ comments });
    })
    .catch(next);
};

const postComment = (request, response, next) => {
  const { username, body } = request.body;
  const { review_id } = request.params;
  newComment(review_id, username, body)
    .then((newComment) => {
      response.status(201).send({ newComment });
    })
    .catch(next);
};

module.exports = {
  getAllCategories,
  getAllReviews,
  getReviewById,
  getComments,
  postComment,
};
