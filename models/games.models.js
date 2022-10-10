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
    .query(`SELECT * FROM reviews WHERE review_id=$1`, [review_id])
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

exports.selectReviews = () => {
  return db
    .query(
      `
    SELECT * FROM reviews
    ORDER BY created_at DESC
    `
    )
    .then(({ rows: reviews }) => {
      return reviews;
    });
};
