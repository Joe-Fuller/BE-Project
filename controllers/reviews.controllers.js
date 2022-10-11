const {
  selectReviewById,
  updateVotes,
  selectReviews,
} = require("../models/reviews.models");

exports.getReviewById = (req, res, next) => {
  const review_id = req.params.review_id;

  selectReviewById(review_id)
    .then((review) => {
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
      res.status(200).send({ review });
    })
    .catch((err) => next(err));
};

exports.getReviews = (req, res, next) => {
  const queries = req.query;
  selectReviews(queries)
    .then((reviews) => {
      res.status(200).send({ reviews });
    })
    .catch((err) => {
      next(err);
    });
};
