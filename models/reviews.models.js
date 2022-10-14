const db = require("../db/connection");
const { selectCategories } = require("./categories.models");

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

exports.insertReview = (body) => {
  if (!body) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }

  if (
    !(
      body.owner &&
      body.title &&
      body.review_body &&
      body.designer &&
      body.category
    )
  ) {
    return Promise.reject({ status: 400, msg: "Missing Required Fields" });
  }

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

  if (!validCategories.includes(body.category)) {
    return Promise.reject({ status: 400, msg: "Invalid Category" });
  }

  const validUsernames = [
    "mallionaire",
    "philippaclaire9",
    "bainesface",
    "dav3rid",
    "tickle122",
    "grumpy19",
    "happyamy2016",
    "cooljmessy",
    "weegembump",
    "jessjelly",
  ];

  if (!validUsernames.includes(body.owner)) {
    return Promise.reject({ status: 400, msg: "Invalid Username" });
  }

  return db
    .query(
      `
  INSERT INTO reviews
  (owner, title, review_body, designer, category)
  VALUES
  ($1, $2, $3, $4, $5)
  RETURNING *`,
      [body.owner, body.title, body.review_body, body.designer, body.category]
    )
    .then(({ rows: [review] }) => {
      return review;
    });
};

exports.selectReviews = (queries) => {
  const category = queries.category;
  const sort_by = queries.sort_by || "created_at";
  const order = queries.order || "desc";
  const limit = queries.limit || 10;
  const page = queries.p || 1;

  const validSortBys = [
    "review_id",
    "title",
    "category",
    "designer",
    "owner",
    "review_body",
    "review_img_url",
    "created_at",
    "votes",
  ];

  if (!validSortBys.includes(sort_by)) {
    return Promise.reject({ status: 404, msg: "Column Not Found" });
  }

  if (!["asc", "desc"].includes(order)) {
    return Promise.reject({
      status: 400,
      msg: "Order must be 'asc' or 'desc'",
    });
  }

  if (limit < 1) {
    return Promise.reject({ status: 400, msg: "Limit must be positive" });
  }

  if (page < 1) {
    return Promise.reject({ status: 400, msg: "p must be positive" });
  }

  return selectCategories()
    .then((categories) => {
      const validCategories = categories.map((cat) => cat.slug);
      if (category && !validCategories.includes(category)) {
        return Promise.reject({ status: 404, msg: "Category Not Found" });
      }
    })
    .then(() => {
      const offset = limit * (page - 1);

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
      ORDER BY ${sort_by} ${order}
      LIMIT ${limit} OFFSET ${offset}
      `;

      const promises = [];

      promises.push(
        db.query(queryString).then(({ rows: reviews }) => {
          if (reviews.length === 0) {
            return Promise.reject({
              status: 400,
              msg: "No Reviews Found",
            });
          }
          return reviews;
        })
      );

      promises.push(
        db
          .query(`SELECT COUNT(*) ::INT FROM reviews`)
          .then(({ rows: [{ count }] }) => {
            return count;
          })
      );

      return Promise.all(promises).then((res) => {
        return { reviews: res[0], total_count: res[1] };
      });
    });
};

exports.removeReview = (review_id) => {
  if (!review_id) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }

  return db
    .query(`DELETE FROM reviews WHERE review_id = $1`, [review_id])
    .then((response) => {
      if (response.rowCount === 0) {
        return Promise.reject({ status: 404, msg: "Review Not Found" });
      }
      return;
    });
};
