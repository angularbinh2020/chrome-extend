//@ts-check
const CONFIG = {
  TIME_INTERVAL: 300,
  RUN_SCRIPT: "RUN_SCRIPT",
  AUTO_RUN: "AUTO_RUN",
  AUTO_RUN_TRUE: "1",
};

function autoAnswers() {
  const currentQuestion = window.currentQuestion;
  if (currentQuestion) {
    const isMultiChoice = Array.isArray(currentQuestion.answer);
    if (isMultiChoice) {
      answerMultiChoice();
    } else {
      answerSingleChoice();
    }
    if (continueAnswer()) {
      setTimeout(autoAnswers, 2000);
    }
  }
}

function continueAnswer() {
  const scoreText = window?.scoreText;
  if (scoreText) return ["1", "2", "3"].includes(scoreText.innerText);
  return false;
}

function answerSingleChoice() {
  const currentQuestion = window.currentQuestion;
  const choice_containers = window.choice_containers;
  if (currentQuestion && choice_containers)
    choice_containers[currentQuestion.answer - 1].click();
}

function answerMultiChoice() {
  const currentQuestion = window.currentQuestion;
  const choice_containers = window.choice_containers;
  if (choice_containers)
    currentQuestion?.answer?.forEach((answerIndex) => {
      choice_containers[Number(answerIndex) - 1].click();
    });
  document.querySelector('[onclick="answer_question_multi()"]')?.click();
}

const isAnswerScreen = location.href;

const showStartBtn =
  !document.getElementById(CONFIG.RUN_SCRIPT) &&
  ["/quizview/start", "/quizview/index"].includes(location.pathname);
const isIndexPage = location.pathname === "/quizview/index";
function startRunScript() {
  if (isIndexPage) {
    sessionStorage.setItem(CONFIG.AUTO_RUN, "1");
    document.querySelector('[href="start"]')?.click();
    return;
  }
  autoAnswers();
}

if (showStartBtn) {
  const exportBtn = document.createElement("button");
  exportBtn.innerText = "Start";
  exportBtn.setAttribute(
    "style",
    "background-color: #f72247a3;color: white;position: fixed;top: 150px;right: 25px;cursor: pointer;display: flex;justify-content: center;align-items: center;width: 4rem;height: 4rem;border-radius: 2rem;border: 1px solid;"
  );
  exportBtn.setAttribute("id", CONFIG.RUN_SCRIPT);
  exportBtn.addEventListener("click", startRunScript);
  document.body.appendChild(exportBtn);
}

const autoRun =
  sessionStorage.getItem(CONFIG.AUTO_RUN) === CONFIG.AUTO_RUN_TRUE;

if (autoRun) {
  setTimeout(() => {
    autoAnswers();
  }, 3000);
  document.getElementById(CONFIG.RUN_SCRIPT)?.remove();
}

if (showStartBtn) {
  sessionStorage.removeItem(CONFIG.AUTO_RUN);
}
console.log("test automation,", new Date().getTime());
