const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(express.json());

// Serve the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Show the orders table page
app.get('/orders', (req, res) => {
  res.sendFile(path.join(__dirname, 'orders.html'));
});

// Serve the raw data as JSON
app.get('/orders.json', (req, res) => {
  fs.readFile('orders.json', 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error reading orders');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

// Save order from Paystack
app.post('/verify-payment', (req, res) => {
  const order = req.body;
  console.log("Received order:", order);

  fs.readFile('orders.json', 'utf8', (err, data) => {
    let orders = [];
    if (!err && data) {
      try {
        orders = JSON.parse(data);
      } catch (e) {
        console.error("Error parsing orders.json:", e);
      }
    }
    orders.push(order);

    fs.writeFile('orders.json', JSON.stringify(orders, null, 2), err => {
      if (err) {
        console.error('Failed to save order:', err);
        return res.status(500).send('Failed to save order');
      }
      res.send({ status: 'success' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
