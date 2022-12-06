const { selectUsers, selectUserByUsername } = require("../models/users.models");

exports.getUsers = (req, res, next) => {
  selectUsers().then((users) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.status(200).send({ users });
  });
};

exports.getUserByUsername = (req, res, next) => {
  const username = req.params.username;

  selectUserByUsername(username)
    .then((user) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.status(200).send({ user });
    })
    .catch((err) => {
      next(err);
    });
};
