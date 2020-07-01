
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');


//________________________________________________________________this will take you to the sign up
router.get('/signup', (req, res) => {
  res.render('signup');
});

//________________________________________________________________this will take you to the login
router.get('/login', (req, res) => {
  res.render('login');
});

//________________________________________________________________this will post the signup
router.post('/signup', (req, res, next) => {
    const { username, password } = req.body;
    //
    if (password.length < 8) {
      res.render('signup', { message: 'Your password has to be 8 characters  minimum' });
      return;
    }
    if (username === '') {
      res.render('signup', { message: 'Your username cannot be empty' });
      return;
    }
    // check if user is in the database
    User.findOne({ username: username }).then(found => {
      if (found !== null) {
        res.render('signup', { message: 'Username is already taken' });
      } else {
        // we create the user and add the hashed password
        const salt = bcrypt.genSaltSync();
        const hash = bcrypt.hashSync(password, salt)
        User.create({ username: username, password: hash })
          .then(dbUser => {
            // log the user in by saving it in the session
            req.session.user = dbUser;
            res.redirect('/profile')
          })
          .catch(err => {
            next(err);
          })
      }
    })
  })

  // middleware to check if user is logged in
const loginCheck = () => {
    return (req, res, next) => {
      // is the user logged in 
      if (req.session.user) {
        next();
      } else {
        res.redirect('/login');
      }
    }
  }


//________________________________________________________________this will post the login
  router.post('/login', (req, res, next) => {
    const { username, password } = req.body;
    if (password.length < 8) {
      res.render('login', { message: 'Your password has to be 8 characters  minimum' });
      return;
    }
    if (username === '') {
      res.render('login', { message: 'Your username cannot be empty' });
      return;
    }
    // check if we have a user with the username from the input in our database
    User.findOne({ username: username }).then(userFromDB => {
      if (userFromDB === null) {
        res.render('login', { message: 'Invalid credentials' });
        return;
      }
      // check if the passwords match
      if (bcrypt.compareSync(password, userFromDB.password)) {
        // password and the hash match
        req.session.user = userFromDB;
        res.redirect('/profile');
      } else {
        // the password from the input and the password from the database don't match
        res.render('login', { message: 'Invalid credentials' });
      }
    })
  });


  module.exports =router