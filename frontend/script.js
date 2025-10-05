// Elements
const submitBtn = document.getElementById('submitBtn');
const feedback = document.getElementById('feedback');
const question = document.getElementById('question');
const answerInput = document.getElementById('answer');
const leaderboard = document.getElementById('leaderboard-body');
const startBtn = document.getElementById('startBtn')
const usernameInput = document.getElementById('username')
const quizContainer = document.getElementById('quiz-container');
const changeUsernameBtn = document.getElementById('changeUserButton');
const userScore = document.getElementById('user-score')

let currentUser = null
let currentQuestionId = null;

//Start Quiz
startBtn.addEventListener('click', () => {
    const name = usernameInput.value.trim();
    if (name) {
        currentUser = name;
        localStorage.setItem('quizUser', name)
        document.getElementById('username-section').style.display = 'none'
        quizContainer.style.display = 'block'
        loadQuestion()
        loadLeaderboard()
        loadUserScore();
    } else {
        alert('Please enter username to start')
    }
})

async function loadUserScore() {
    if (!currentUser) return;
    const res = await fetch(`/score/${currentUser}`);
    if (!res.ok) {
        console.error(`Response status: ${res.status}`);
        return;
    }
    const data = await res.json();
    userScore.textContent = `Your Score: ${data.total_score}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('quizUser')
    if (savedUser) {
        currentUser = savedUser
        document.getElementById('username-section').style.display = 'none';
        quizContainer.style.display = 'block';
        loadQuestion()
        loadLeaderboard()
    }
})

changeUsernameBtn.addEventListener('click', () => {
    localStorage.removeItem('quizUser')
    currentUser = null
    quizContainer.style.display = 'none'
    document.getElementById('username-section').style.display = 'block'
});


// load a question to the question div
async function loadQuestion() {
    const res = await fetch('/questions');
    if (!res.ok) {
        throw new Error(`Response status: ${res.status}`);
    }
    const data = await res.json();
    currentQuestionId = data.id;
    question.textContent = data.question;
}



submitBtn.addEventListener('click', async () => {
    const user_answer = answerInput.value;
    const res = await fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: currentUser,
            questionId: currentQuestionId,
            answer: user_answer
        })
    });
    if (!res.ok) {
        throw new Error(`Response status: ${res.status}`);
    }
    const data = await res.json()
    if (data.correct) {
        feedback.textContent = "Correct!";
        feedback.className = ('correct');
        loadUserScore();
    } else {
        feedback.textContent = "Incorrect!"
        feedback.className = ('incorrect')
    }

    answerInput.value = ""
    setTimeout(() => {
        loadQuestion();
        loadLeaderboard();
    }, 2000);
})

async function loadLeaderboard() {
    const res = await fetch('/leaderboard');
    if (!res.ok) {
        throw new Error(`Response status: ${res.status}`);
    }

    const data = await res.json()

    let rank = 0
    leaderboard.innerHTML = "";
    data.forEach(player => {

        const row = document.createElement('tr');

        const rankCell = document.createElement('td')
        rankCell.textContent = rank += 1
        const userCell = document.createElement('td');
        userCell.textContent = player.username
        const scoreCell = document.createElement('td');
        scoreCell.textContent = player.total_score;

        row.appendChild(rankCell)
        row.appendChild(userCell)
        row.appendChild(scoreCell)

        leaderboard.appendChild(row)
    });
}

loadQuestion();
loadLeaderboard();
loadUserScore();



