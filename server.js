const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const users = [];
const messages = [];
const JWT_SECRET = 'secret';

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Заполните все поля' });
  if (users.find(u => u.username === username)) return res.status(400).json({ error: 'Пользователь существует' });
  const hashed = bcrypt.hashSync(password, 10);
  users.push({ username, password: hashed });
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

wss.on('connection', ws => {
  ws.username = null;
  ws.on('message', data => {
    const msg = JSON.parse(data.toString());
    if (msg.type === 'authenticate') {
      try {
        const payload = jwt.verify(msg.token, JWT_SECRET);
        ws.username = payload.username;
      } catch (e) { ws.close(); }
    } else if (msg.type === 'message' && ws.username) {
      const text = msg.text.trim();
      if (!text) return;
      const message = {
        username: ws.username,
        text,
        time: new Date().toISOString()
      };
      messages.push(message);
      wss.clients.forEach(c => c.send(JSON.stringify(message)));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port \${PORT}`));
