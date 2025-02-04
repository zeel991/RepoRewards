require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/github/callback",
},
(accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});


app.get('/auth/github', (req, res) => {
  passport.authenticate('github')(req, res);
});


app.get('/auth/github/callback', passport.authenticate('github', {
  failureRedirect: '/login',
}), (req, res) => {

  res.redirect('/profile');
});


app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.send(`
    <h1>Welcome, ${req.user.displayName}</h1>
    <img src="${req.user.photos[0].value}" alt="Avatar" width="100" />
    <p>GitHub Username: ${req.user.username}</p>
    <p>GitHub Profile: <a href="https://github.com/${req.user.username}" target="_blank">Visit Profile</a></p>
  `);
});

// Login route
app.get('/login', (req, res) => {
  res.send('<h1>Please log in</h1><a href="/auth/github">Login with GitHub</a>');
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/login');
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
