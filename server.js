const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// File paths
const USERS_FILE = './users.json';
const ORDERS_FILE = './orders.json';
const WALLETS_FILE = './wallets.json';

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Register route
app.post('/register', (req, res) => {
  const { email, password, name } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE));
  if (users.find(u => u.email === email)) {
    return res.status(400).send('User already exists');
  }
  const newUser = { email, password, name, approved: false };
  users.push(newUser);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.send('Registered. Await admin approval.');
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE));
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).send('Invalid credentials');
  if (!user.approved) return res.status(403).send('Account pending admin approval');
  res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

// Admin approves user manually (you can later build a simple admin page)
app.get('/admin/approve/:email', (req, res) => {
  const users = JSON.parse(fs.readFileSync(USERS_FILE));
  const user = users.find(u => u.email === req.params.email);
  if (user) {
    user.approved = true;
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.send('User approved!');
  } else {
    res.send('User not found');
  }
});

app.listen(PORT, () => {
  console.log(`MDBundles server running on http://localhost:${PORT}`);
});
