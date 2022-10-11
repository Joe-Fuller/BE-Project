const db = require("../db/connection");
const { selectReviewById } = require("./reviews.models");

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
      if (comments.length === 0) {
        return Promise.reject({ status: 404, msg: "Comments Not Found" });
      }
      return comments;
    });
};

exports.insertCommentByReviewId = (body, author, review_id) => {
  if (!(body && author)) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }

  let promises = [selectReviewById(review_id)];

  promises.push(
    db
      .query(
        `
  INSERT INTO comments 
  (body, author, review_id)
  VALUES
  ($1, $2, $3)
  RETURNING *`,
        [body, author, review_id]
      )
      .then(({ rows: [comment] }) => {
        return comment;
      })
  );

  return Promise.all(promises)
    .then((response) => {
      return response[1];
    })
    .catch((err) => {
      return Promise.reject({ status: err.status, msg: err.msg });
    });
};
