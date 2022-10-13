const reviewRouter = require("express").Router();

const {
  getCommentsByReviewId,
  postCommentByReviewId,
} = require("../controllers/comments.controllers");
const {
  getReviewById,
  patchVotes,
  getReviews,
} = require("../controllers/reviews.controllers");

reviewRouter.get("/", getReviews);
reviewRouter.get("/:review_id", getReviewById);
reviewRouter.patch("/:review_id", patchVotes);

reviewRouter
  .route("/:review_id/comments")
  .get(getCommentsByReviewId)
  .post(postCommentByReviewId);

module.exports = reviewRouter;
