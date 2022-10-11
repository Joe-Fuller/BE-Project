const {
  selectCommentsByReviewId,
  insertCommentByReviewId,
} = require("../models/comments.models");

exports.getCommentsByReviewId = (req, res, next) => {
  const review_id = req.params.review_id;
  selectCommentsByReviewId(review_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCommentByReviewId = (req, res, next) => {
  const review_id = req.params.review_id;
  insertCommentByReviewId(review_id)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};
