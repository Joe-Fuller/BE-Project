const db = require("../db/connection");

exports.selectCategories = () => {
  return db.query(`SELECT * FROM categories`).then(({ rows: categories }) => {
    return categories;
  });
};

exports.insertCategory = (newCategory) => {
  if (!(newCategory.slug && newCategory.description)) {
    return Promise.reject({ status: 400, msg: "Missing Required Fields" });
  }

  return db
    .query(
      `
  INSERT INTO categories
  (slug, description)
  VALUES 
  ($1, $2)
  RETURNING *`,
      [newCategory.slug, newCategory.description]
    )
    .then(({ rows: [category] }) => {
      return category;
    });
};
