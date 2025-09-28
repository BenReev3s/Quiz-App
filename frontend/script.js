// Elements
const submitBtn = document.getElementById('submitBtn');
const feedback = document.getElementById('feedback');
const question = document.getElementById('question');
const answerInput = document.getElementById('answer');
const leaderboard = document.getElementById('leaderboard-body');

let currentQuestionId = null;

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
            username: "Ben",
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

    data.forEach(player => {
        leaderboard.innerHTML = "";
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

loadQuestion()
loadLeaderboard()



