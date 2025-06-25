const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(express.json());

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve access orders page
app.get('/orders', (req, res) => {
  fs.readFile('orders.json', 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error loading orders');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

// ✅ THIS IS THE BLOCK TO ADD (handles saving orders)
app.post('/verify-payment', (req, res) => {
  const order = req.body;

  // Read existing orders
  fs.readFile('orders.json', 'utf8', (err, data) => {
    const orders = err ? [] : JSON.parse(data || '[]');
    orders.push(order);

    // Write updated orders
    fs.writeFile('orders.json', JSON.stringify(orders, null, 2), err => {
      if (err) return res.status(500).send('Failed to save order');
      res.send({ status: 'success' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
