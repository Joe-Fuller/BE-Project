const {
  selectCategories,
  selectReviewById,
} = require("../models/games.models");

exports.getCategories = (req, res, next) => {
  selectCategories().then((categories) => {
    res.status(200).send({ categories });
  });
};

exports.getReviewById = (req, res, next) => {
  const review_id = req.params.review_id;

  if (!review_id) {
    res.status(400).send({ msg: "Bad Request" });
  } else {
    selectReviewById(review_id)
      .then((review) => {
        if (review) {
          res.status(200).send({ review });
        } else {
          res.status(404).send({ msg: "Not Found" });
        }
      })
      .catch((err) => {
        next(err);
      });
  }
};
