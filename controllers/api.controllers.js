const { selectApi } = require("../models/api.models");

exports.getApi = (req, res, next) => {
  selectApi().then((api) => {
    //res.set("Access-Control-Allow-Origin", "*");
    res.status(200).send({ api });
  });
};
