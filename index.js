const express = require('express');
const { get } = require('axios');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
require('dotenv').config();

let items;
const port = process.env.PORT || 4321;
const URL = 'https://kodaktor.ru/j/users';
const app = express();

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: `http://localhost:${port}/auth/google/callback`
  },
  function(token, tokenSecret, profile, done) {
      return done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

app
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(session({ secret: 'mysecret', resave: true, saveUninitialized: true}))
    .use(passport.initialize())
    .use(passport.session())
    .get('/', r => r.res.render('author', { name: 'Наталья Кузнецова' }))
    .get(/hello/, r => r.res.end('Hello world!'))
    .get(/author/, r => {
        r.res.render('author', { name: 'Наталья Кузнецова' })
    })
    .get('/login', r => r.res.render('login'))
    .get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }))
    .get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(r) {
        r.res.redirect('/users');
    })
    .get(/users/, async (req, res) => {
        if (req.isAuthenticated()) {
            res.render('list', { title: 'Login list', items });
        } else {
            res.redirect('/login');
        }
    })
    .get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    })
    .use(r => r.res.status(404).end('Not here, sorry'))
    .use((e, r, res, n) => res.status(500).end(`Error: ${e}`))
    .set('view engine', 'pug')
    .listen(port, async () => {
    console.log(`Start process ${process.pid}`);
    ({ data: { users: items }} = await get(URL));
});