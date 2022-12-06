const {
  selectCategories,
  insertCategory,
} = require("../models/categories.models");

exports.getCategories = (req, res, next) => {
  selectCategories().then((categories) => {
    //res.set("Access-Control-Allow-Origin", "*");
    res.status(200).send({ categories });
  });
};

exports.postCategory = (req, res, next) => {
  const newCategory = req.body;

  insertCategory(newCategory)
    .then((category) => {
      //res.set("Access-Control-Allow-Origin", "*");
      res.status(201).send({ category });
    })
    .catch((err) => {
      next(err);
    });
};
