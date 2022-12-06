const {
  selectCommentsByReviewId,
  insertCommentByReviewId,
  removeComment,
  updateVotes,
} = require("../models/comments.models");

exports.getCommentsByReviewId = (req, res, next) => {
  const review_id = req.params.review_id;
  const queries = req.query;
  selectCommentsByReviewId(review_id, queries)
    .then((comments) => {
      //res.set("Access-Control-Allow-Origin", "*");
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
      //res.set("Access-Control-Allow-Origin", "*");
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteComment = (req, res, next) => {
  const comment_id = req.params.comment_id;

  removeComment(comment_id)
    .then(() => {
      //res.set("Access-Control-Allow-Origin", "*");
      res.status(204).send({});
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchVotes = (req, res, next) => {
  const comment_id = req.params.comment_id;
  const votes = req.body.inc_votes;

  updateVotes(comment_id, votes)
    .then((comment) => {
      //res.set("Access-Control-Allow-Origin", "*");
      res.status(200).send({ comment });
    })
    .catch((err) => next(err));
};
