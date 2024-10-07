// Import express, set up router
const express = require("express");
const router = express.Router();

// Import functionality from the view controller
const {
  renderAllPokemon,
  renderOnePokemon,
  renderCreatePokemonForm,
  renderUpdatePokemonForm,
} = require("../../controllers/view/viewController");

const User = require('../../models/userModel');
const Pokemon = require('../../models/pokemonModel');

const {
  createUser,
  loginUser,
  addFavoritePokemonToUser,
} = require('../../controllers/api/userController');

router.get("/", (req, res) => {
  res.render("index");
});

// localhost:3000/allMons
router.get("/allMons", renderAllPokemon);
// localhost:3000/oneMon/:name
router.get("/oneMon/:name", renderOnePokemon);
// localhost:3000/createOneMon
router.get("/createOneMon", renderCreatePokemonForm);
// localhost:3000/updateMon/:name
router.get("/updateMon/:name", renderUpdatePokemonForm);

/*
    7. Set up sign-up and log-in form routes
*/
router.get('/signUp', function (req, res) {
  res.render('signup-form', {message: ''});
})

router.post('/api/user/createUser', async function (req, res) {
  try {
    // if there's a user with that username already
    const foundUser = await User.findOne({ username: req.body.username });
    if (foundUser) {
      // render the signup page again with a message
      //   telling the user that username already exists
      return res.render('signup-form', {message: 'A user exists with that username.'})
    }

    await createUser(req.body);
    res.redirect('/logIn');
  } catch (error) {
    console.log(error);
    res.send('An error occurred.');
  }
})

router.get('/logIn', function (req, res) {
  res.render('login-form', {message: ''});
})

router.post('/api/user/logInUser', async function (req, res) {
  try {
    const loginResult = await loginUser(req.body);
    if (typeof loginResult === 'string') {
      // if loginResult is a string,
      //   render the login form with that result as a message
      return res.render('login-form', { message: loginResult });
    }

    if (loginResult === false) {
      return res.render('login-form', { message: 'Incorrect password' });
    }

    const user = await User.findOne({username: req.body.username})
    // store in the session that they're logged in
    req.session.isLoggedIn = true;
    req.session.user = {
      username: user.username,
      id: user._id,
    };

    res.redirect('/user');
  } catch (error) {
    console.log(error);
    res.send('An error occurred.');
  }
})

/*
    12. Set up front-end route for the user page
*/

router.get('/user', async function (req, res) {
  try {
    if (!req.session.isLoggedIn) {
      return res.redirect('/logIn');
    }

    const foundUser = await User.findById(req.session.user.id);
    const faves = await Pokemon.find({_id: {$in: foundUser.favoritePokemon}});
    res.render('user', {user: foundUser, favoritePokemon: faves});
  } catch (error) {
    console.log(error);
    res.send('An error occurred.');
  }
})

/*
    17. Set up log out route to end sessions
*/

router.get('/logout', function (req, res) {
  try {
    // clear the cookie
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      secure: false,
      maxAge: null,
    })

    req.session.destroy();
    res.redirect('/logIn');
  } catch (error) {
    console.log(error);
    res.send('An error occurred.');
  }
})

router.put('/users/addFavoritePokemon', async function (req, res) {
  const updatedUser = await addFavoritePokemonToUser(
    req.session.user.id,
    req.body.pokemonId
  )

  res.redirect('/user')
})

module.exports = router;
