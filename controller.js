const { devData } = require("./db/data/development-data/index");
const {
  readCategories,
  readReviews,
  fetchReviewById,
  fetchComments,
  newComment,
  updateReviewVote,
  viewUsers,
  arrangeReviews,
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

const patchReviewVote = (request, response, next) => {
  const { review_id } = request.params;
  const { inc_votes } = request.body;

  updateReviewVote(review_id, inc_votes)
    .then((review) => {
      response.status(200).send({ review });
    })
    .catch(next);
};

const seeAllUsers = (request, response, next) => {
  viewUsers()
    .then((users) => {
      response.status(200).send({ users });
    })
    .catch((err) => {
      {
        next(err);
      }
    });
};

const viewAllReviews = (request, response, next) => {
  const { sort_by } = request.query;
  const { order } = request.query;
  const { category } = request.query;
  arrangeReviews(sort_by, order, category)
    .then((reviews) => {
      response.status(200).send({ reviews });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = {
  getAllCategories,
  getAllReviews,
  getReviewById,
  getComments,
  postComment,
  patchReviewVote,
  seeAllUsers,
  viewAllReviews,
};
