const commentRouter = require("express").Router();

const {
  deleteComment,
  patchVotes,
} = require("../controllers/comments.controllers");

commentRouter.route("/:comment_id").patch(patchVotes).delete(deleteComment);

module.exports = commentRouter;
