const categoryRouter = require("express").Router();
const { getCategories } = require("../controllers/categories.controllers");

categoryRouter.get("/", getCategories);

module.exports = categoryRouter;
