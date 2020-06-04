const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;
const passport = require('passport');
const JWT = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

passport.use(
  new JwtStrategy({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: "some secret",
      passReqToCallback: true
    },
    async (req, payload, done) => {
      try {
        // Find the user specified in token
        let user = await User.findAll({
          where: {
            id: payload.sub
          }
        });
        
        if (!user) {
          return done(null, false)
        }
        req.user = user
        done(null, user)
      } catch (error) {
        done(error, false)
      }
    }
  )
)

const signToken = (user) => {
  console.log("USer---", user);
  return JWT.sign({
      iss: 'demo',
      sub: user.id,
      iat: new Date().getTime(),
      exp: new Date().setDate(new Date().getDate() + 1)
    },
    "some secret"
  )
}

// Create and Save a new User
exports.signup = (req, res) => {
  if (!req.body.email) {
    res.status(400).send({
      message: "Email can not be empty!"
    });
    return;
  }

  const user = {
    email: req.body.email,
    password: req.body.password
  };

  //Check whether user already present in database or not
  User.count({
      where: {
        email: req.body.email
      }
    })
    .then(count => {
      if (count != 0) {
        res.send({
          message: "User already exists"
        });
      } else {
        //Save User in the database
        User.create(user)
          .then(data => {
            res.send(signToken(data));
          })
          .catch(err => {
            res.status(500).send({
              message: err.message
            });
          });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message
      });
    });
};

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  //Check whether user already present in database or not
  User.findOne({
      where: {
        email: req.body.email,
        password: req.body.password
      }
    })
    .then(response => {
      if (response) {
        console.log("response==", response);
        res.send(signToken(response));
        // res.send(response);
      } else {
        res.send({
          message: "Invalid credentials!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message
      });
    });
};

exports.private = (req, res) => {
  res.send(req.user);
};

exports.public = (req, res) => {
  res.send("Public API");
};