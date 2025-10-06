const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const bcrypt = require('bcrypt');

const app = express();
const port = 8080;

app.use(express.json());

app.use(express.static('frontend'));

app.get('/questions', (req, res) => {
    db.get(
        `SELECT * FROM questions ORDER BY RANDOM() LIMIT 1`,
        (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(row)
        }
    );
});

app.post('/submit', (req, res) => {
    const { username, questionId, answer } = req.body;
    db.get(
        `SELECT correct_answer FROM questions WHERE id = ?`,
        [questionId],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message })
                return;
            };
            const isCorrect = row && row.correct_answer.toLowerCase() === answer.toLowerCase()

            if (isCorrect) {
                db.run(
                    `INSERT INTO scores (username, score) VALUES (?, 1)`,
                    [username],
                    function (err) {
                        if (err) {
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        res.json({ correct: true, scoreId: this.lastID })
                    }
                );
            } else {
                res.json({ correct: false })
            }

        }
    );
});

app.get('/leaderboard', (req, res) => {
    db.all(
        `SELECT username, SUM(score) as total_score FROM scores GROUP BY username ORDER by total_score DESC LIMIT 10`,
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message })
                return;
            }
            res.json(rows)
        }
    );
});

app.get('/score/:username', (req, res) => {
    const username = req.params.username; // get name from URL

    db.get(
        `SELECT SUM(score) as user_score FROM scores WHERE username = ?`,
        [username],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            // send JSON response
            res.json({
                username: username,
                total_score: row.user_score || 0 // 0 if user has no scores yet
            });
        }
    );
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and Password required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
            `INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint')) {
                        return res.status(400).json({ error: 'Username already exists' });
                    }
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'User registered succesfully', userId: this.lastID });
            }
        );
    } catch (err) {
        res.status(500).json({ errer: 'server error' })
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password is required" });
    }
    db.get(`SELECT password FROM users WHERE username = ?`, [username],
        async (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (!row) {
                return res.status(404).json({ error: 'User not found' });
            }
            const isValid = await bcrypt.compare(password, row.password);
            if (isValid) {
                res.json({ message: 'Login Succesful', username })
            }
            else {
                res.status(401).json({ error: 'Invalid credentials' })
            }
        }
    );
});

app.listen(port, () => {
    console.log(`server running at http://localhost${port}`);
});