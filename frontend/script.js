// Elements
const submitBtn = document.getElementById('submitBtn');
const feedback = document.getElementById('feedback');
const question = document.getElementById('question');
const answerInput = document.getElementById('answer');
const leaderboard = document.getElementById('leaderboard-body');
const quizContainer = document.getElementById('quiz-container');
const changeUsernameBtn = document.getElementById('changeUserButton');
const userScore = document.getElementById('user-score')

const username = document.getElementById('username');
const password = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const authFeedback = document.getElementById('auth-feedback');

let currentUser = null
let currentQuestionId = null;

registerBtn.addEventListener('click', async () => {
    const usernameInput = username.value.trim()
    const passwordInput = password.value.trim()

    if (!username || !password) {
        authFeedback.textContent = "Please enter a username and password"
        authFeedback.style.color = "red";
        return;
    }

    try {
        const res = await fetch('/register', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput
            })
        });
        const data = await res.json()

        if (res.ok) {
            authFeedback.textContent = "Registered Successfully! Please login."
            authFeedback.style.color = "green"
            username.value = ""
            password.value = ""
            console.log("Registration successful")
        } else {
            authFeedback.textContent = data.error || "Registeration failed."
            authFeedback.style.color = "red"
        }
    } catch (err) {
        console.error(err);
        authFeedback.textContent = "Server error - please try again later.";
        authFeedback.style.color = "red";
    }
});

loginBtn.addEventListener('click', async () => {
    const usernameInput = username.value.trim();
    const passwordInput = password.value.trim();
    if (!usernameInput || !passwordInput) {
        authFeedback.textContent = "Pleaser enter your username and password"
        authFeedback.style.color = "red";
        return;
    }
    try {
        const res = await fetch('/login', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput
            })
        });

        const data = await res.json();

        if (res.ok) {
            console.log('Login successful: ', data);
            currentUser = usernameInput
            localStorage.setItem('quizUser', usernameInput)
            loadQuestion()
            loadLeaderboard()
        } else {
            authFeedback.textContent = data.error || 'Invalid Login.';
            authFeedback.style.color = "red";
        }
    } catch (err) {
        console.error(err)
        authFeedback.textContent = "Server error during login"
    }
});

registerBtn.addEventListener('click', async () => {

});

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

changeUsernameBtn.addEventListener('click', () => {
    localStorage.removeItem('quizUser')
    currentUser = null
    quizContainer.style.display = 'none'

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



