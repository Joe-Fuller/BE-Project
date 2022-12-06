const {
  selectReviewById,
  updateVotes,
  selectReviews,
  insertReview,
  removeReview,
} = require("../models/reviews.models");

exports.getReviewById = (req, res, next) => {
  const review_id = req.params.review_id;

  selectReviewById(review_id)
    .then((review) => {
      //res.set("Access-Control-Allow-Origin", "*");
      res.status(200).send({ review });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchVotes = (req, res, next) => {
  const review_id = req.params.review_id;
  const votes = req.body.inc_votes;

  updateVotes(review_id, votes)
    .then((review) => {
      //res.set("Access-Control-Allow-Origin", "*");
      res.status(200).send({ review });
    })
    .catch((err) => next(err));
};

exports.getReviews = (req, res, next) => {
  const queries = req.query;
  selectReviews(queries)
    .then((response) => {
      //res.set("Access-Control-Allow-Origin", "*");
      res.status(200).send(response);
    })
    .catch((err) => {
      next(err);
    });
};

exports.postReview = (req, res, next) => {
  const body = req.body;

  insertReview(body)
    .then((review) => {
      //res.set("Access-Control-Allow-Origin", "*");
      res.status(201).send({ review });
    })
    .catch((err) => next(err));
};

exports.deleteReview = (req, res, next) => {
  const review_id = req.params.review_id;

  removeReview(review_id)
    .then(() => {
      //res.set("Access-Control-Allow-Origin", "*");
      res.status(204).send({});
    })
    .catch((err) => {
      next(err);
    });
};
