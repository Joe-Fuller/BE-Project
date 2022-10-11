const db = require("../db/connection");

exports.selectReviewById = (review_id) => {
  return db
    .query(
      `
        SELECT reviews.*, COUNT(reviews.review_id) AS comment_count
        FROM reviews 
        LEFT JOIN comments 
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

exports.selectReviews = (queries) => {
  const validCategories = [
    "euro game",
    "social deduction",
    "dexterity",
    "children's games",
    "strategy",
    "hidden-roles",
    "push-your-luck",
    "roll-and-write",
    "deck-building",
    "engine-building",
  ];

  const category = queries.category;

  if (category && !validCategories.includes(category)) {
    return Promise.reject({ status: 404, msg: "Category Not Found" });
  }

  let queryString = `
  SELECT reviews.*, COUNT(comments.review_id) ::INT AS comment_count
  FROM reviews 
  LEFT JOIN comments 
  ON reviews.review_id = comments.review_id
  `;

  if (category) {
    queryString += `WHERE reviews.category = `;
    if (category === "children's games") {
      queryString += `'children''s games'`;
    } else {
      queryString += `'${category}'`;
    }
  }

  queryString += ` 
  GROUP BY reviews.review_id 
  ORDER BY created_at DESC`;

  return db.query(queryString).then(({ rows: reviews }) => {
    if (reviews.length === 0) {
      return Promise.reject({
        status: 400,
        msg: "No Reviews In That Category",
      });
    }
    return reviews;
  });
};
