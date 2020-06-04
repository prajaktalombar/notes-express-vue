module.exports = app => {
  const users = require("../controllers/user.controller.js");
  const passport = require('passport');
  var router = require("express").Router();

  const passportJWT = passport.authenticate('jwt', {
  session: false
  })
  // Create a new Tutorial
  router.post("/signup", users.signup);

  router.post("/login", users.login);

  router.get("/private",passportJWT,users.private);

  router.get("/public",users.public);

  app.use('/api', router);
};