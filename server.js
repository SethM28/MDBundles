const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(express.json());

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve pretty orders table (admin view)
app.get('/orders', (req, res) => {
  res.sendFile(path.join(__dirname, 'orders.html'));
});

// Serve order data as raw JSON
app.get('/orders.json', (req, res) => {
  fs.readFile('orders.json', 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error reading orders');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

// Handle Paystack payment verification and save order
app.post('/verify-payment', (req, res) => {
  const order = req.body;
  console.log("Received order:", order);

  fs.readFile('orders.json', 'utf8', (err, data) => {
    const orders = err ? [] : JSON.parse(data || '[]');
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
