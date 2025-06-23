const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(express.json());

// Serve the main homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the hidden orders page (accessed after password entry)
app.get('/orders.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'orders.html'));
});

// Endpoint to return all orders as JSON
app.get('/orders', (req, res) => {
  fs.readFile('orders.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json([]);
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

// Endpoint to save a new order
app.post('/save-order', (req, res) => {
  const newOrder = req.body;
  fs.readFile('orders.json', 'utf8', (err, data) => {
    let orders = [];
    if (!err && data) {
      try {
        orders = JSON.parse(data);
      } catch (e) {}
    }
    orders.push(newOrder);
    fs.writeFile('orders.json', JSON.stringify(orders, null, 2), err => {
      if (err) return res.status(500).send('Failed to save order');
      res.send('Order saved');
    });
  });
});

// Dummy verify-payment endpoint for testing
app.post('/verify-payment', (req, res) => {
  res.send({ success: true });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
