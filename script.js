let allquestions = [];
const ttlquestioncount = 15;
let selectedquestion = [];
let currentindex = 0;
let mark = 0;
let userselectedanswer = [];
let questionTimer = 60; // 30 seconds per question
let questionTimeLeft = questionTimer; // Time left for the current question
let timeInterval; // To store the timer interval


// Initialization

const Loadpage = (path) => {
    fetch(`./pages/${path}`)
        .then((data) => data.text())
        .then((html) => {
            document.getElementById("app").innerHTML = html;
            initialize(path);
        })
        .catch((err) => {
            console.log(err);
        });
};

document.addEventListener("DOMContentLoaded", () => {
    Loadpage("login.html");
    fetch("questions.json")
        .then((data) => data.json())
        .then((questions) => {
            allquestions = questions;
            selectRandomquestion();
        });
});

const initialize = (path) => {
    if (path == "login.html") {
        document.getElementById('userform').addEventListener('submit', (e) => {
            e.preventDefault();

            const userName = document.getElementById("name").value;
            const userEmail = document.getElementById("mail").value;
            Loadpage("terms.html");
        });
    } else if (path == "terms.html") {
        document.getElementById("start").addEventListener("click", () => {
            Loadpage("quiz.html");
        });
    } else if (path == "quiz.html") {
        //showtimer(); // Start the timer
        showquestion(); // Display the first question

        document.getElementById("next").addEventListener('click', () => {
            let selectedAnswer = document.querySelector('input[name="answer"]:checked');
            if (!selectedAnswer) {
                alert("Please select an answer before proceeding.");
                return;
            }
            if (selectedAnswer.value == selectedquestion[currentindex].correct) {
                mark++;
            }

            userselectedanswer[currentindex] = selectedAnswer.value;
            currentindex++;
            if (currentindex < ttlquestioncount) {
                showquestion(); // Show next question
            }
        });

        document.getElementById("prev").addEventListener("click", () => {
            let selectedAnswer = document.querySelector('input[name="answer"]:checked');
            if (selectedAnswer) {
                userselectedanswer[currentindex] = selectedAnswer.value;
            }
            currentindex--;
            showquestion(); // Show previous question
        });

        document.getElementById("submit").addEventListener("click", () => {
            let selectedAnswer = document.querySelector('input[name="answer"]:checked');
            if (!selectedAnswer) {
                alert("Please select an answer before submitting.");
                return;
            }
            if (selectedAnswer.value == selectedquestion[currentindex].correct) {
                mark++;
            }

            userselectedanswer[currentindex] = selectedAnswer.value;
            Loadpage("result.html");
        });
    } else if (path == "result.html") {
        document.getElementById("mark").textContent = `Your score is ${mark}/${ttlquestioncount}`;

        document.getElementById("viewanswer").addEventListener("click", () => {
            Loadpage("answer.html");
        });
    } else if (path == "answer.html") {
        showanswer();
    }
};

const selectRandomquestion = () => {
    let shuffledquestion = allquestions.sort(() => {
        return 5 - Math.floor(Math.random() * 10);
    });
    selectedquestion = shuffledquestion.slice(0, ttlquestioncount);
};

const showquestion = () => {
    const currentquestion = selectedquestion[currentindex];
    const questioncontainer = document.getElementById("question");

    questioncontainer.innerHTML = `
        <h1 style="font-size: 30px;">Question ${currentindex + 1}: ${currentquestion.question}</h1>
        ${currentquestion.answers.map((ans, ind) => {
            return `<div style="margin: 10px">
            <label style="margin: 10px; cursor:pointer;"><input style="margin-right: 10px;" type="radio" name="answer" value="${ind}" ${userselectedanswer[currentindex] == ind ? 'checked' : ''}>${ans}</label></div>`;
        }).join("")}
    `;

    // Hide/show previous button
    if (currentindex == 0) {
        document.getElementById("prev").style.display = "none";
    } else {
        document.getElementById("prev").style.display = "inline";
    }

    // Show/hide next and submit button
    if (currentindex == ttlquestioncount - 1) {
        document.getElementById("next").style.display = "none";
        document.getElementById("submit").style.display = "inline";
    } else {
        document.getElementById("next").style.display = "inline";
        document.getElementById("submit").style.display = "none";
    }

    // Reset the timer for the current question
    resetQuestionTimer();
};

const showanswer = () => {
    document.getElementById("answercontainer").innerHTML = selectedquestion.map((question, qno) =>
        `
        <div>
            <p style="margin-top: 10px;">Question  ${qno + 1}: ${question.question}</p>
            ${question.answers.map((ans, ind) => {
                let color = "black";
                if (question.correct == ind) {
                    color = "green";
                } else if (userselectedanswer[qno] == ind) {
                    color = "red";
                }

                return `<p style="color:${color}">${ans}</p>`;
            }).join("")}
        </div>
        `
    ).join("");
};

const resetQuestionTimer = () => {
    // Clear previous timer if it exists
    if (timeInterval) {
        clearInterval(timeInterval);
    }
    // Set the question time left to 30 seconds
    questionTimeLeft = questionTimer;
    // Start the timer for this question
    startQuestionTimer();
};

const startQuestionTimer = () => {
    const timer = document.getElementById("timer");
    timer.innerHTML = formattimer(questionTimeLeft);

    timeInterval = setInterval(() => {
        questionTimeLeft--;
        timer.innerText = formattimer(questionTimeLeft);
        if (questionTimeLeft === 0) {
            clearInterval(timeInterval); // Stop the timer
            currentindex++; // Move to the next question
            if (currentindex < ttlquestioncount) {
                showquestion(); // Show next question
            } else {
                Loadpage("Result.html"); // If it's the last question, submit the results
            }
        }
    }, 1000);
};

const formattimer = (duration) => {
    let seconds = Math.floor(duration % 60);
    let minutes = Math.floor((duration / 60) % 60);
    let hours = Math.floor(duration / (60 * 60));

    return ` ${String(minutes).padStart(2, 0)}:${String(seconds).padStart(2, 0)}`;
};

