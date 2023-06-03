const { startApp } = require("./app");

const port = process.env.PORT || 3000;
startApp().then((app) =>
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  })
);
