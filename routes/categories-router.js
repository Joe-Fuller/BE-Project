const categoryRouter = require("express").Router();
const {
  getCategories,
  postCategory,
} = require("../controllers/categories.controllers");

categoryRouter.route("/").get(getCategories).post(postCategory);

module.exports = categoryRouter;
