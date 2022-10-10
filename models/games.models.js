const db = require("../db/connection");

exports.selectCategories = () => {
  return db.query(`SELECT * FROM categories`).then(({ rows: categories }) => {
    return categories;
  });
};

exports.selectUsers = () => {
  return db.query(`SELECT * FROM users`).then(({ rows: users }) => {
    return users;
  });
};
exports.selectReviewById = (review_id) => {
  return db
    .query(
      `
      SELECT reviews.*, COUNT(reviews.review_id) AS comment_count
      FROM reviews 
      JOIN comments 
      ON reviews.review_id = comments.review_id
      WHERE reviews.review_id=$1
      GROUP BY reviews.review_id
`,
      [review_id]
    )
    .then(({ rows: [review] }) => {
      if (review) {
        return review;
      } else {
        return Promise.reject({ status: 404, msg: "Not Found" });
      }
    });
};

exports.updateVotes = (review_id, votes) => {
  if (!votes) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  } else {
    return db
      .query(
        `UPDATE reviews SET votes=votes+$1 WHERE review_id=$2 RETURNING *`,
        [votes, review_id]
      )
      .then(({ rows: [review] }) => {
        return review;
      });
  }
};
