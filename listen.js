const app = require("./app");
// const { PORT = 9090 } = process.env;

let port = process.env.PORT || 9090;

app.listen(port, (err) => {
  if (err) throw err;
  console.log(`Listening on ${port}...`);
});
