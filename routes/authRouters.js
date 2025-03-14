const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { createUser, getUserByUsername, deleteUser } = require('../services/mongoDB');

const router = express.Router();

router.use(
  session({
    secret: 'super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 },
  })
);

router.post('/register', async (req, res) => {
  if (req.session.user) {
    return res.render('error', { message: 'You are already logged in.' });
  }
  const { username, password, phoneNumber, profession, bio, interests, profilePic, isAdmin = false } = req.body;
  if (!username || !password) {
    return res.render('error', { message: 'Username and password are required' });
  }

  try {
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.render('error', { message: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser(
      username,
      hashedPassword,
      phoneNumber || '',
      profession || '',
      bio || '',
      interests ? interests.split(',') : [],
      profilePic || '/default-avatar.png',
      isAdmin
    );

    req.session.regenerate((err) => {
      if (err) {
        return res.render('error', { message: 'Server error. Could not regenerate session.' });
      }
      req.session.user = { id: newUser._id, username: newUser.username, isAdmin: newUser.isAdmin };
      req.session.save((err) => {
        if (err) {
          return res.render('error', { message: 'Server error. Could not save session.' });
        }
        return res.redirect(isAdmin ? '/admin' : '/loggedin');
      });
    });
  } catch (err) {
    return res.render('error', { message: 'Server error during registration' });
  }
});


router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
      const user = await getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: 'Invalid username' });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      req.session.regenerate((err) => {
        if (err) {
          return res.status(500).json({ error: 'Server error. Please try again later.' });
        }
        req.session.user = { id: user._id, username: user.username, isAdmin: user.isAdmin };
        req.session.save((err) => {
          if (err) {
            return res.status(500).json({ error: 'Server error. Please try again later.' });
          }
          return res.json({
            success: true,
            redirectTo: user.isAdmin ? '/admin' : '/loggedin',
          });
        });
      });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
  });
  
router.post('/logout', (req, res) => {
  if (!req.session.user) {
    return res.render('error', { message: 'You are not logged in.' });
  }
  req.session.destroy((err) => {
    if (err) {
      return res.render('error', { message: 'Server error. Please try again later.' });
    }
    return res.redirect('/');
  });
});

router.get('/loggedin', (req, res) => {
  if (!req.session.user) {
    return res.render('error', { message: 'You must be logged in to view this page.' });
  }
  return res.render('loggedin', { user: req.session.user });
});

router.delete('/users/:userId', async (req, res) => {
  try {
    const result = await deleteUser(req.params.userId);
    if (result.deletedCount === 0) {
      return res.render('error', { message: 'User not found' });
    }
    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    return res.render('error', { message: 'Server error' });
  }
});

module.exports = router;
