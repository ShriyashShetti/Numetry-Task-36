const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8081;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "shriyash27@",
    database: "simple_habit_tracker"  // ✅ Updated database name
});

db.connect(err => {
    if (err) throw err;
    console.log("✅ Connected to MySQL");
});

// Create new habit
app.post("/habits", (req, res) => {
    const { user_id, habit_name } = req.body;
    const sql = "INSERT INTO habits (user_id, habit_name) VALUES (?, ?)";
    db.query(sql, [user_id, habit_name], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ id: result.insertId, user_id, habit_name });
    });
});

// Get habits by user ID
app.get("/habits/:user_id", (req, res) => {
    const { user_id } = req.params;
    db.query("SELECT * FROM habits WHERE user_id = ?", [user_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send(result);
    });
});

// Mark habit as done for today
app.post("/habits/:habit_id/log", (req, res) => {
    const { habit_id } = req.params;
    const today = new Date().toISOString().slice(0, 10);
    const sql = "INSERT INTO habit_logs (habit_id, log_date, completed) VALUES (?, ?, ?)";
    db.query(sql, [habit_id, today, true], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ success: true });
    });
});

// Get habit logs (history)
app.get("/habits/:habit_id/logs", (req, res) => {
    const { habit_id } = req.params;
    db.query("SELECT * FROM habit_logs WHERE habit_id = ?", [habit_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send(result);
    });
});

// Delete a habit
app.delete("/habits/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM habits WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
