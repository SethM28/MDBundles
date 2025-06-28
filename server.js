// Serve pretty orders page
app.get('/orders', (req, res) => {
  res.sendFile(path.join(__dirname, 'orders.html'));
});

// Serve raw data for that page
app.get('/orders-json', (req, res) => {
  fs.readFile('orders.json', 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error reading orders');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});
