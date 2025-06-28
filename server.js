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

// ✅ Serve pretty orders HTML page
app.get('/orders', (req, res) => {
  res.sendFile(path.join(__dirname, 'orders.html'));
});

// ✅ Serve raw order data for orders.html
app.get('/orders-json', (req, res) => {
  fs.readFile('orders.json', 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error reading orders');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

// ✅ Save new orders sent from Paystack
app.post('/verify-payment', (req, res) => {
  const order = req.body;
  console.log("Received order:", order);

  fs.readFile('orders.json', 'utf8', (err, data) => {
    const orders = err ? [] : JSON.parse(data || '[]');
    orders.push(order);

    fs.writeFile('orders.json', JSON.stringify(orders, null, 2), err => {
      if (err) return res.status(500).send('Failed to save order');
      res.send({ status: 'success' });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
