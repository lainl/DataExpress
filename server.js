const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const authRouter = require('./routes/authRouters');
const { getAllUsers, getUserById } = require('./services/mongoDB');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.set('views', path.join(__dirname, 'View'));
app.set('view engine', 'ejs');

app.use(authRouter);

app.get('/', (req, res) => {
  if (req.session.user && !req.session.user.isAdmin) {
    res.render('loggedin', { user: req.session.user });
  } else if (req.session.user && req.session.user.isAdmin) {
    res.redirect('/admin');
  } else {
    res.render('home', { user: null });
  }
});

app.get('/login', (req, res) => {
  if (req.session.user && !req.session.user.isAdmin) {
    res.render('loggedin', { user: req.session.user });
  } else if (req.session.user && req.session.user.isAdmin) {
    res.redirect('/admin');
  } else {
    res.render('Home', { user: null });
  }
});


app.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('Register');
});

app.get('/profile/:userId', async (req, res) => {
  try {
    const user = await getUserById(req.params.userId);
    if (!user) return res.status(404).send('User not found');
    res.render('profile', { user });
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

app.get('/admin', (req, res) => {
  if (!req.session.user?.isAdmin)
    return res.status(403).redirect('/?error=Access denied');
  res.render('AdminOnly', { user: req.session.user });
});

app.post('/getAllUsers', async (req, res) => {
  if (!req.session.user?.isAdmin)
    return res.status(403).send({ error: 'Access denied' });
  try {
    const users = await getAllUsers();
    res.send(users);
  } catch (err) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
