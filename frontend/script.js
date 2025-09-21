// Elements
const submitBtn = document.getElementById('submitBtn');
const feedback = document.getElementById('feedback');
const question = document.getElementById('question');
const answerInput = document.getElementById('answer')

let currentQuestionId = null;

// load a question to the question div
async function loadQuestion() {
    const res = await fetch('/questions');
    if (!res.ok) {
        throw new Error(`Response status: ${res.status}`);
    }
    const data = await res.json();
    currentQuestionId = data.id
    question.textContent = data.question
}

loadQuestion()

submitBtn.addEventListener('click', () => {
    feedback.textContent = "Correct!";
    feedback.className = ('correct');
})