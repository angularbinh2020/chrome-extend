//@ts-check
const CONFIG = {
  TIME_INTERVAL: 300,
  EXPORT_ID: "EXPORT_ID",
  XLSX_SCRIPT_ID: "XLSX_SCRIPT_ID",
  LOADING_CONTAINER_ID: "LOADING_CONTAINER_ID",
  LOADING_PROCESS_ID: "LOADING_PROCESS_ID",
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

if (!document.getElementById(CONFIG.EXPORT_ID)) {
  const exportBtn = document.createElement("button");
  exportBtn.innerText = "Export data";
  exportBtn.setAttribute(
    "style",
    "background-color: #f72247a3;color: white;position: fixed;top: 150px;right: 25px;cursor: pointer;display: flex;justify-content: center;align-items: center;width: 4rem;height: 4rem;border-radius: 2rem;border: 1px solid;"
  );
  exportBtn.setAttribute("id", CONFIG.EXPORT_ID);
  exportBtn.addEventListener("click", exportData);
  document.body.appendChild(exportBtn);
}
