const express = require('express');
const bodyParser = require('body-parser')
const db = require('./db')

const app = express();
const port = 8080;

app.use(bodyParser.json());

app.get('/questions', (red, res) => {
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

app.post('/submit', (res, req) => {
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
                    `INSERT INTO scores (username, score) VLAUES (?, 1)`,
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

app.get('./leaderboard', (res, req) => {
    db.all(
        `SELECT username, SUM(score), as total_score FROM scores GROUP BY username ORDER by total_score DESC LIMIT 10`,
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message })
                return;
            }
            res.json(rows)
        }
    );
});

app.listen(port, () => {
    console.log(`server running at http://localhost${port}`);
});