const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'mdbundles-secret',
  resave: false,
  saveUninitialized: true
}));

// Pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/register.html', (req, res) => res.sendFile(path.join(__dirname, 'register.html')));
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.send('Login required');
  if (!req.session.user.approved) return res.send('Account not approved yet');
  res.send(`<h2>Welcome ${req.session.user.name}</h2><p>Your dashboard is under construction.</p>`);
});

// Registration
app.post('/register', (req, res) => {
  const newUser = { ...req.body, approved: false };
  const users = fs.existsSync('users.json') ? JSON.parse(fs.readFileSync('users.json')) : [];
  users.push(newUser);
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  res.send('Registration complete! Await admin approval.');
});

// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = fs.existsSync('users.json') ? JSON.parse(fs.readFileSync('users.json')) : [];
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.send('Invalid login');
  req.session.user = user;
  res.redirect('/dashboard');
});

// Admin approval view
app.get('/admin', (req, res) => {
  const users = fs.existsSync('users.json') ? JSON.parse(fs.readFileSync('users.json')) : [];
  let html = '<h2>Admin Approval</h2>';
  users.forEach((u, i) => {
    html += `<p>${u.name} (${u.email}) - ${u.approved ? '✅ Approved' : '❌ Pending'} 
      <a href="/approve?i=${i}">Approve</a></p>`;
  });
  res.send(html);
});

// Approve user
app.get('/approve', (req, res) => {
  const i = req.query.i;
  const users = JSON.parse(fs.readFileSync('users.json'));
  users[i].approved = true;
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  res.redirect('/admin');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
