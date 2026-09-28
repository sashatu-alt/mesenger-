const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

const messages = [];

// Получить все сообщения
app.get("/api/messages", (req, res) => {
  res.json(messages);
});

// Отправить новое сообщение
app.post("/api/send", (req, res) => {
  const name = req.body.name || "Аноним";
  const text = req.body.text || "";
  if (text.trim()) {
    messages.push({
      name: name.slice(0, 20),
      text: text.slice(0, 200),
      time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
    });
    if (messages.length > 50) messages.shift();
  }
  res.json({ ok: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Мессенджер запущен на порту " + port));
