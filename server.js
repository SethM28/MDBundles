const express = require('express'); const fs = require('fs'); const path = require('path'); const app = express(); const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname)); app.use(express.json());

// Serve the homepage app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

// Serve the registration page app.get('/register', (req, res) => { res.sendFile(path.join(__dirname, 'register.html')); });

// Handle registration data app.post('/register', (req, res) => { const newUser = req.body;

fs.readFile('users.json', 'utf8', (err, data) => { const users = err ? [] : JSON.parse(data || '[]');

const usernameExists = users.find(u => u.username === newUser.username);
if (usernameExists) {
  return res.status(400).json({ status: 'fail', message: 'Username already taken' });
}

users.push(newUser);
fs.writeFile('users.json', JSON.stringify(users, null, 2), err => {
  if (err) return res.status(500).send('Error saving user');
  res.json({ status: 'success' });
});

}); });

// Serve the orders display page app.get('/orders', (req, res) => { res.sendFile(path.join(__dirname, 'orders.html')); });

// Raw orders data app.get('/orders.json', (req, res) => { fs.readFile('orders.json', 'utf8', (err, data) => { if (err) return res.status(500).send('Error reading orders'); res.setHeader('Content-Type', 'application/json'); res.send(data); }); });

// Save orders from Paystack callback app.post('/verify-payment', (req, res) => { const order = req.body; order.time = new Date().toLocaleString(); console.log("Received order:", order);

fs.readFile('orders.json', 'utf8', (err, data) => { const orders = err ? [] : JSON.parse(data || '[]'); orders.push(order);

fs.writeFile('orders.json', JSON.stringify(orders, null, 2), err => {
  if (err) {
    console.error('Failed to save order:', err);
    return res.status(500).send('Failed to save order');
  }
  res.send({ status: 'success' });
});

}); });

app.listen(PORT, () => { console.log(Server is running on port ${PORT}); });


