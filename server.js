const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(__dirname));
app.use(express.json());

// Serve the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the admin access orders page
app.get('/orders', (req, res) => {
  fs.readFile('orders.json', 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error reading orders');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

// ✅ Endpoint for verifying and saving payment orders
app.post('/verify-payment', (req, res) => {
  const order = req.body;
  console.log("Received order:", order);

  // Read existing orders
  fs.readFile('orders.json', 'utf8', (err, data) => {
    let orders = [];
    if (!err && data) {
      try {
        orders = JSON.parse(data);
      } catch (parseErr) {
        console.error("Error parsing existing orders:", parseErr);
      }
    }

    orders.push(order);

    // Save updated orders
    fs.writeFile('orders.json', JSON.stringify(orders, null, 2), (err) => {
      if (err) {
        console.error("Failed to save order:", err);
        return res.status(500).send('Failed to save order');
      }
      res.send({ status: 'success' });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
