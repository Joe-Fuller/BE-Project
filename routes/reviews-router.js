const reviewRouter = require("express").Router();

const {
  getCommentsByReviewId,
  postCommentByReviewId,
} = require("../controllers/comments.controllers");
const {
  getReviewById,
  patchVotes,
  getReviews,
  postReview,
} = require("../controllers/reviews.controllers");

reviewRouter.route("/").get(getReviews).post(postReview);
reviewRouter.route("/:review_id").get(getReviewById).patch(patchVotes);

reviewRouter
  .route("/:review_id/comments")
  .get(getCommentsByReviewId)
  .post(postCommentByReviewId);

module.exports = reviewRouter;
