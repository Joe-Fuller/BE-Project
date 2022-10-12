const express = require("express");

const { getCategories } = require("./controllers/categories.controllers");
const { getUsers } = require("./controllers/users.controllers");
const {
  getReviewById,
  patchVotes,
  getReviews,
} = require("./controllers/reviews.controllers");
const {
  getCommentsByReviewId,
  postCommentByReviewId,
  deleteComment,
} = require("./controllers/comments.controllers");

const app = express();
app.use(express.json());

app.get("/api/categories", getCategories);

app.get("/api/users", getUsers);

app.get("/api/reviews", getReviews);
app.get("/api/reviews/:review_id", getReviewById);
app.get("/api/reviews/:review_id/comments", getCommentsByReviewId);
app.patch("/api/reviews/:review_id", patchVotes);

app.post("/api/reviews/:review_id/comments", postCommentByReviewId);

app.delete("/api/comments/:comment_id", deleteComment);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Not Found" });
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad Request" });
  }
});

module.exports = app;
