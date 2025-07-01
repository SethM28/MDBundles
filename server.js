// server.js const express = require('express'); const fs = require('fs'); const path = require('path'); const app = express(); const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname)); app.use(express.json());

// Serve homepage app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

// --- USER AUTH --- const USERS_FILE = path.join(__dirname, 'users.json');

app.post('/register', (req, res) => { const { username, password, email } = req.body; if (!username || !password || !email) return res.json({ success: false, message: 'All fields required' });

const users = fs.existsSync(USERS_FILE) ? JSON.parse(fs.readFileSync(USERS_FILE)) : []; if (users.find(u => u.username === username)) { return res.json({ success: false, message: 'Username already exists' }); }

users.push({ username, password, email }); fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2)); res.json({ success: true }); });

app.post('/login', (req, res) => { const { username, password } = req.body; const users = fs.existsSync(USERS_FILE) ? JSON.parse(fs.readFileSync(USERS_FILE)) : []; const user = users.find(u => u.username === username && u.password === password); if (!user) return res.json({ success: false, message: 'Invalid credentials' }); res.json({ success: true }); });

// --- ORDERS --- app.get('/orders', (req, res) => { res.sendFile(path.join(__dirname, 'orders.html')); });

app.get('/orders.json', (req, res) => { fs.readFile('orders.json', 'utf8', (err, data) => { if (err) return res.status(500).send('Error reading orders'); res.setHeader('Content-Type', 'application/json'); res.send(data); }); });

app.post('/verify-payment', (req, res) => { const order = req.body; order.time = new Date().toLocaleString(); console.log("Received order:", order);

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

