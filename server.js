// server.js (part of your Render backend for MDBundles)
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

const ORDERS_FILE = path.join(__dirname, 'orders.json');
const ADMIN_PASSWORD = 'Sethdora28';

// Make sure orders.json exists
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]');

// Save new order
app.post('/verify-payment', (req, res) => {
  const order = {
    id: Date.now(),
    ...req.body,
    status: 'pending'
  };

  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
  orders.push(order);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));

  res.json({ success: true });
});

// Admin login route
app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
});

// Get orders (admin only)
app.get('/admin/orders', (req, res) => {
  const auth = req.headers['authorization'];
  if (auth !== ADMIN_PASSWORD) return res.status(403).json({ message: 'Forbidden' });

  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
  res.json(orders);
});

// Mark order complete
app.post('/admin/orders/:id/complete', (req, res) => {
  const auth = req.headers['authorization'];
  if (auth !== ADMIN_PASSWORD) return res.status(403).json({ message: 'Forbidden' });

  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
  const id = parseInt(req.params.id);
  const index = orders.findIndex(o => o.id === id);

  if (index >= 0) {
    orders[index].status = 'completed';
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running...');
});
