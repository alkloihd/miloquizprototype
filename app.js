// app.js

const app = document.getElementById('app');

let studentName = '';
let selectedQuiz = '';
let quizzes = [];
let texts = [];
let currentQuizData = null;
let studentResponses = [];

document.addEventListener('DOMContentLoaded', () => {
  loadQuizzes();
});

function loadQuizzes() {
  // List all available quizzes and corresponding texts
  quizzes = ['text1worksheet.json', 'text2worksheet.json']; // Add more quiz JSON filenames as needed
  texts = ['text1.txt', 'text2.txt']; // Add more text filenames as needed

  displayQuizList();
}

function displayQuizList() {
  const title = document.createElement('h1');
  title.textContent = 'Available Quizzes';

  const list = document.createElement('ul');
  list.className = 'quiz-list';

  quizzes.forEach((quizFile, index) => {
    const listItem = document.createElement('li');
    const quizName = `Quiz ${index + 1}: ${getQuizTitle(quizFile)}`;
    listItem.textContent = quizName;

    const startButton = document.createElement('button');
    startButton.textContent = 'Start Quiz';
    startButton.addEventListener('click', () => {
      selectedQuiz = quizFile;
      loadQuizData(quizFile, texts[index]);
    });

    listItem.appendChild(startButton);
    list.appendChild(listItem);
  });

  app.innerHTML = '';
  app.appendChild(title);
  app.appendChild(list);
}

function getQuizTitle(quizFile) {
  // Optionally, fetch quiz title for display. For simplicity, return a default title
  if (quizFile === 'text1worksheet.json') return 'Human Body Systems';
  if (quizFile === 'text2worksheet.json') return 'Biodiversity and Classification';
  if (quizFile === 'text3worksheet.json') return 'Grade 7 geography example';
  if (quizFile === 'text4worksheet.json') return 'grade 7 history example';


  return 'Unknown Quiz';
}

function loadQuizData(quizFile, textFile) {
  fetchQuizData(quizFile).then(quizData => {
    currentQuizData = quizData;
    fetchTextData(textFile).then(textData => {
      displayStudentNameEntry(textData);
    });
  }).catch(error => {
    console.error('Error loading quiz data:', error);
    alert('Failed to load quiz data. Please check the console for details.');
  });
}

function fetchQuizData(quizFile) {
  return fetch(`./${quizFile}`) // Fetching from root directory
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    });
}

function fetchTextData(textFile) {
  return fetch(`./${textFile}`) // Fetching from root directory
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    });
}

function displayStudentNameEntry(textData) {
  const title = document.createElement('h1');
  title.textContent = currentQuizData.quizTitle;

  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Enter your name:';
  nameLabel.setAttribute('for', 'student-name');

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.id = 'student-name';
  nameInput.placeholder = 'Your Name';

  const continueButton = document.createElement('button');
  continueButton.textContent = 'Continue';
  continueButton.addEventListener('click', () => {
    studentName = nameInput.value.trim();
    if (studentName) {
      displayQuizPage(textData);
    } else {
      alert('Please enter your name.');
    }
  });

  app.innerHTML = '';
  app.appendChild(title);
  app.appendChild(nameLabel);
  app.appendChild(document.createElement('br'));
  app.appendChild(nameInput);
  app.appendChild(document.createElement('br'));
  app.appendChild(document.createElement('br'));
  app.appendChild(continueButton);
}

function displayQuizPage(textData) {
  const title = document.createElement('h1');
  title.textContent = currentQuizData.quizTitle;

  const textDisplay = document.createElement('div');
  textDisplay.className = 'text-display';
  textDisplay.textContent = textData;

  const form = document.createElement('form');
  form.id = 'quiz-form';

  currentQuizData.questions.forEach(question => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.id = `question-${question.id}`; // Assign unique ID for styling

    const questionTitle = document.createElement('h3');
    questionTitle.innerHTML = question.question;
    questionDiv.appendChild(questionTitle);

    if (question.type === 'multipleChoice') {
      const optionsList = document.createElement('ul');
      optionsList.className = 'options';
      question.options.forEach(option => {
        const optionItem = document.createElement('li');
        const optionLabel = document.createElement('label');
        const optionRadio = document.createElement('input');
        optionRadio.type = 'radio';
        optionRadio.name = `question-${question.id}`;
        optionRadio.value = option;
        optionLabel.appendChild(optionRadio);
        optionLabel.appendChild(document.createTextNode(option));
        optionItem.appendChild(optionLabel);
        optionsList.appendChild(optionItem);
      });
      questionDiv.appendChild(optionsList);
    } else if (question.type === 'trueFalse') {
      const optionsList = document.createElement('ul');
      optionsList.className = 'options';

      ['True', 'False'].forEach(option => {
        const optionItem = document.createElement('li');
        const optionLabel = document.createElement('label');
        const optionRadio = document.createElement('input');
        optionRadio.type = 'radio';
        optionRadio.name = `question-${question.id}`;
        optionRadio.value = option;
        optionLabel.appendChild(optionRadio);
        optionLabel.appendChild(document.createTextNode(option));
        optionItem.appendChild(optionLabel);
        optionsList.appendChild(optionItem);
      });

      questionDiv.appendChild(optionsList);
    } else if (question.type === 'fillInTheBlank') {
      const blankCount = question.answers.length;
      const questionParts = question.question.split('_____');

      // Clear the question div and rebuild with inputs
      questionDiv.innerHTML = '';

      questionParts.forEach((part, index) => {
        const partSpan = document.createElement('span');
        partSpan.textContent = part;
        questionDiv.appendChild(partSpan);

        if (index < blankCount) {
          const blankInput = document.createElement('input');
          blankInput.type = 'text';
          blankInput.name = `question-${question.id}-blank-${index + 1}`;
          blankInput.className = 'blank-input';
          blankInput.placeholder = `Blank ${index + 1}`;
          questionDiv.appendChild(blankInput);
        }
      });
    } else if (question.type === 'shortAnswer') {
      const textarea = document.createElement('textarea');
      textarea.name = `question-${question.id}`;
      textarea.rows = 4;
      textarea.placeholder = 'Your Answer Here...';
      questionDiv.appendChild(textarea);
    }

    form.appendChild(questionDiv);
  });

  const submitButtonDiv = document.createElement('div');
  submitButtonDiv.className = 'button-container';
  const submitButton = document.createElement('button');
  submitButton.type = 'button';
  submitButton.textContent = 'Submit Quiz';
  submitButton.addEventListener('click', processQuizResults);
  submitButtonDiv.appendChild(submitButton);

  form.appendChild(submitButtonDiv);

  app.innerHTML = '';
  app.appendChild(title);
  app.appendChild(textDisplay);
  app.appendChild(form);
}

function processQuizResults() {
  const form = document.getElementById('quiz-form');
  const formData = new FormData(form);
  studentResponses = [];
  let totalScore = 0;
  let possibleScore = 0;

  currentQuizData.questions.forEach(question => {
    if (['multipleChoice', 'trueFalse', 'fillInTheBlank'].includes(question.type)) {
      if (question.type === 'fillInTheBlank') {
        possibleScore += question.answers.length;
        for (let i = 0; i < question.answers.length; i++) {
          const response = formData.get(`question-${question.id}-blank-${i + 1}`) || '';
          const correctAnswer = question.answers[i];
          const isCorrect = response.trim().toLowerCase() === correctAnswer.toLowerCase();
          if (isCorrect) totalScore += 1;

          studentResponses.push({
            id: `${question.id}-blank-${i + 1}`,
            question: question.question,
            response: response,
            correctAnswer: correctAnswer,
            isCorrect: isCorrect
          });
        }
      } else {
        possibleScore += 1;
        const response = formData.get(`question-${question.id}`) || '';
        let correctAnswer = '';
        if (question.type === 'trueFalse') {
          correctAnswer = question.answer ? 'True' : 'False';
        } else {
          correctAnswer = question.answer;
        }
        const isCorrect = response.trim().toLowerCase() === correctAnswer.toLowerCase();
        if (isCorrect) totalScore += 1;

        studentResponses.push({
          id: question.id,
          question: question.question,
          response: response,
          correctAnswer: correctAnswer,
          isCorrect: isCorrect
        });
      }
    } else if (question.type === 'shortAnswer') {
      const response = formData.get(`question-${question.id}`) || '';
      studentResponses.push({
        id: question.id,
        question: question.question,
        response: response,
        correctAnswer: 'N/A',
        isCorrect: null
      });
    }
  });

  displayResults(totalScore, possibleScore);
}

function displayResults(totalScore, possibleScore) {
  const title = document.createElement('h1');
  title.textContent = 'Quiz Results';

  const scorePara = document.createElement('p');
  scorePara.textContent = `${studentName}, you scored ${totalScore} out of ${possibleScore}.`;

  const resultsDiv = document.createElement('div');

  studentResponses.forEach(response => {
    const resultItem = document.createElement('div');
    resultItem.className = 'result';

    // Add 'correct' or 'incorrect' class based on the response
    if (response.isCorrect === true) {
      resultItem.classList.add('correct');
    } else if (response.isCorrect === false) {
      resultItem.classList.add('incorrect');
    }

    const questionText = document.createElement('p');
    questionText.innerHTML = `<strong>Question ${response.id}:</strong> ${response.question}`;
    resultItem.appendChild(questionText);

    const responseText = document.createElement('p');
    responseText.innerHTML = `<strong>Your Answer:</strong> ${response.response}`;
    resultItem.appendChild(responseText);

    if (response.isCorrect !== null) {
      const correctness = document.createElement('p');
      correctness.innerHTML = `<strong>Result:</strong> ${response.isCorrect ? 'Correct' : 'Incorrect'}`;
      resultItem.appendChild(correctness);
    }

    resultsDiv.appendChild(resultItem);
  });

  const downloadButtonDiv = document.createElement('div');
  downloadButtonDiv.className = 'button-container';
  const downloadButton = document.createElement('button');
  downloadButton.textContent = 'Download Results';
  downloadButton.addEventListener('click', downloadCSV);
  downloadButtonDiv.appendChild(downloadButton);

  app.innerHTML = '';
  app.appendChild(title);
  app.appendChild(scorePara);
  app.appendChild(resultsDiv);
  app.appendChild(downloadButtonDiv);
}

function downloadCSV() {
  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += `Student Name,${studentName}\n`;
  csvContent += `Question ID,Question,Your Answer,Correct Answer,Result\n`;

  studentResponses.forEach(response => {
    let answerField = response.response;
    let correctAnswerField = response.correctAnswer;
    let resultField = response.isCorrect === null ? 'N/A' : (response.isCorrect ? 'Correct' : 'Incorrect');

    // Escape double quotes by replacing " with ""
    answerField = `"${answerField.replace(/"/g, '""')}"`;
    correctAnswerField = `"${correctAnswerField.replace(/"/g, '""')}"`;

    csvContent += `${response.id},"${response.question}",${answerField},${correctAnswerField},${resultField}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${studentName}_quiz_results.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
