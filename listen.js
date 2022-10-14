const app = require("./app");
// const { PORT = 9090 } = process.env;

const port = process.env.PORT || 8000;

app.listen(port, (err) => {
  if (err) throw err;
  console.log(`Listening on ${PORT}...`);
});
