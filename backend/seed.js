const db = require('./db');

db.serialize(() => {
    db.run(`INSERT INTO questions (question, correct_answer) VALUES
        ('What does HTML stand for?', 'HyperText Markup Language'),
        ('What does CSS stand for?', 'Cascading Style Sheets'),
        ('What is the keyword to declare a variable in JavaScript?', 'let'),
        ('Which symbol is used for comments in JavaScript?', '//')`
        , (err) => {
            if (err) {
                console.log("Error inserting questions: ", err.message);
            } else {
                console.log("Questions added successfully")
            }
            db.close()
        });
});