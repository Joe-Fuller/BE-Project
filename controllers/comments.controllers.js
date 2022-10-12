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
  const body = req.body.body;
  const author = req.body.username;
  insertCommentByReviewId(body, author, review_id)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteComment = (req, res, next) => {
  const comment_id = req.params.comment_id;

  removeComment(comment_id)
    .then(res.status(204))
    .catch((err) => {
      next(err);
    });
};
