const db = require("../db/connection");
const { selectReviewById } = require("./reviews.models");

exports.selectCommentsByReviewId = (review_id, queries) => {
  const limit = queries.limit || 10;
  const page = queries.p || 1;

  if (limit < 1) {
    return Promise.reject({ status: 400, msg: "Limit must be positive" });
  }

  if (page < 1) {
    return Promise.reject({ status: 400, msg: "p must be positive" });
  }

  const offset = limit * (page - 1);

  let promises = [selectReviewById(review_id)];

  promises.push(
    db
      .query(
        `
    SELECT comments.*
    FROM reviews
    JOIN comments
    ON reviews.review_id = comments.review_id
    WHERE comments.review_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3`,
        [review_id, limit, offset]
      )
      .then(({ rows: comments }) => {
        return comments;
      })
  );

  return Promise.all(promises)
    .then((response) => {
      if (response[1].length === 0) {
        return Promise.reject({
          status: 200,
          msg: "No Comments Found For This Review",
        });
      }
      return response[1];
    })
    .catch((err) => {
      if (err.code === "22P02") {
        err = { status: 400, msg: "Bad Request" };
      }
      return Promise.reject({ status: err.status, msg: err.msg });
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

exports.removeComment = (comment_id) => {
  if (!comment_id) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }

  return db
    .query(`DELETE FROM comments WHERE comment_id = $1`, [comment_id])
    .then((response) => {
      if (response.rowCount === 0) {
        return Promise.reject({ status: 404, msg: "Comment Not Found" });
      }
      return;
    });
};

exports.updateVotes = (comment_id, votes) => {
  if (!votes) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  } else {
    return db
      .query(
        `UPDATE comments SET votes=votes+$1 WHERE comment_id=$2 RETURNING *`,
        [votes, comment_id]
      )
      .then(({ rows: [comment] }) => {
        if (comment) {
          return comment;
        } else {
          return Promise.reject({ status: 404, msg: "Comment Not Found" });
        }
      });
  }
};
