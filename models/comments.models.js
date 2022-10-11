const db = require("../db/connection");

exports.selectCommentsByReviewId = (review_id) => {
  return db
    .query(
      `SELECT comments.*
    FROM reviews
    JOIN comments
    ON reviews.review_id = comments.review_id
    WHERE comments.review_id = $1
    ORDER BY created_at DESC`,
      [review_id]
    )
    .then(({ rows: comments }) => {
      return comments;
    });
};
