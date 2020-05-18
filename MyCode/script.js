const delayTime = 2000; // wachttijd voor de volgende vraag
const myQuestion = document.getElementById('myQuestion');
const myAnswer = document.getElementById('myAnswer');
const quizWrapper = document.getElementById('quizWrapper');
const goodscore = document.getElementById("goodscore");
const wrongscore = document.getElementById("wrongscore");
const name = document.getElementById("name");
const namefield = document.getElementById("nameField");
const nameBox = document.getElementById("nameBox");
const chooseBox = document.getElementById("chooseBox");
const myQuizes = document.getElementById("myQuizes");
let quizfiles = ["./Jsons/quiz.json", "./Jsons/quiz1.json", "./Jsons/quiz2.json"];
let quizen = [];
let quiz;

let playerData = {}; // object, hierin worden de game gegevens opgeslagen

let counter = 0;
let canAnswer = true;

let vragen = [];
// for(let i = 0; i < quizfiles.length; i++){
//     quizen.push(quizfiles[i]);
// }
setName();

function setName() {
    questionBox.style.display = "none";
    chooseBox.style.display = "none";
    resultBox.style.display = "none";
    nameBox.style.display = "block";
}

namefield.addEventListener("keyup", keyPressed);

function keyPressed() {
    if (event.keyCode === 13) {
        console.log(namefield.value);
        playerData.playerName = namefield.value;
        chooseQuiz();
    }
}

function chooseQuiz() {
    nameBox.style.display = "none";
    chooseBox.style.display = "block";
    let q = [];

    //standaard
    let quizname = document.createElement('li');
    quizname.className = "quizen";
    quizname.innerHTML = "Play all [random]";
    quizname.addEventListener('click', quizGekozen, true);
    q.push(quizname);

    //haal alle quizen op en daarvan de quiz name
    for (let i = 0; i < quizfiles.length; i++) {
        makeAjaxCall(quizfiles[i], "GET").then(handleReceivedData); // doe het! wacht op promise
        function handleReceivedData(jsonString) { // pak de data aan
            let tijdelijkeQuiz = (JSON.parse(jsonString));

            let quizname2 = document.createElement('li');
            quizname2.className = "quizen";
            quizname2.innerHTML = tijdelijkeQuiz.quizMetaData.title;
            quizname2.addEventListener('click', quizGekozen, true);
            q.push(quizname2);


            if(q.length - 1 == quizfiles.length){
                for (let i = 0; i < q.length; i++) {
                    myQuizes.appendChild(q[i]);
                }
            }
        }
    }
}

function quizGekozen() {
    let title = getSelection().anchorNode.textContent;
    console.log("TITLE: " + title)
    if(title == "Play all [random]"){
        for (let i = 0; i < quizfiles.length; i++) {
            makeAjaxCall(quizfiles[i], "GET").then(handleReceivedData); // doe het! wacht op promise
            function handleReceivedData(jsonString) { // pak de data aan
                quiz = (JSON.parse(jsonString));
                quizen.push(quiz);

                if(quizen.length == quizfiles.length){
                    //get random quiz
                    let num = getRandomInt(0, quizen.length - 1);
                    quiz = quizen[num];
                    quizen.splice(num, 1);
                    initQuiz();
                }
            }
        }
    }else {
        for (let i = 0; i < quizfiles.length; i++) {
            makeAjaxCall(quizfiles[i], "GET").then(handleReceivedData); // doe het! wacht op promise
            function handleReceivedData(jsonString) { // pak de data aan
                tijdelijkquiz = (JSON.parse(jsonString));
                console.log(tijdelijkquiz);
                console.log(tijdelijkquiz.quizMetaData.title);
                console.log(title);
                if (title == tijdelijkquiz.quizMetaData.title) {
                    quiz = tijdelijkquiz;
                    console.log("ja dit gaat goed!");
                    initQuiz();
                    return;
                }
            }
        }
    }
}

function initQuiz() {
    questionBox.style.display = "block";
    chooseBox.style.display = "none";
    resultBox.style.display = "none";
    nameBox.style.display = "none";
    // reset alle player game variabelen
    playerData.goodAnswers = 0;
    playerData.wrongAnswers = 0;
    counter = 0;
    resultBox.style.display = "none"; // verberg de resultbox
    //zorg dat alle vragen worden verwisseld (random maken)
    vragen = [];
    for (let i = 0; i < quiz.quizContent.length; i++) {
        vragen.push(i);
    }
    vragen = shuffleArray(vragen);

    prepareQuestions(); // start de quiz
}

function prepareQuestions() {
    if (counter < vragen.length) {
        questionBox.className = "questionBox-new";

        quizWrapper.style.backgroundImage = "url(" + quiz.quizMetaData.imageURI + ")";
        myQuestion.innerHTML = quiz.quizContent[vragen[counter]].question;
        myAnswer.innerHTML = "";
        canAnswer = true;
        //plaats alle antwoorden in een array om deze vervolgens te schudden zodat je custom vragen lijst krijgt
        //en het dus niet allemaal op dezelfde plek staat
        let answers = [];
        for (let i = 0; i < quiz.quizContent[vragen[counter]].answers.length; i++) {
            let answer = document.createElement('li');
            answer.className = "answer";
            answer.score = quiz.quizContent[vragen[counter]].answers[i].feedback;
            answer.innerHTML = quiz.quizContent[vragen[counter]].answers[i].answer;
            answer.addEventListener('click', evaluate, true);
            answers.push(answer);
        }
        answers = shuffleArray(answers);
        for (let i = 0; i < answers.length; i++) {
            myAnswer.appendChild(answers[i]);
        }
    } else {
        finishQuiz();
    }
}

function evaluate(evt) {
    if (canAnswer) {
        console.log(evt.target.className);
        canAnswer = false;
        if (evt.target.score) {
            evt.target.className = "right";
            playerData.goodAnswers += 1; // increase good score
            console.log(playerData.goodAnswers);
            console.log(playerData.wrongAnswers);
        } else {
            evt.target.className = "wrong";
            playerData.wrongAnswers += 1; // increase wrong score
            console.log(playerData.goodAnswers);
            console.log(playerData.wrongAnswers);
        }
        counter++;
        questionBox.className = "questionBox";
        setTimeout(prepareQuestions, delayTime);
    }
}

function finishQuiz() {
    goodscore.innerHTML = "Goeden Antwoorden: " + playerData.goodAnswers;
    wrongscore.innerHTML = "fouten Antwoorden: " + playerData.wrongAnswers;
    name.innerHTML = "Player naam: " + playerData.playerName;
    if (playerData.playerName === "") name.innerHTML = "Playername: -";

    goodscore.className = "questionBox-new";
    wrongscore.className = "questionBox-new";
    name.className = "questionBox-new";

    questionBox.style.display = "none";
    resultBox.style.display = "block";
}

function newQuiz() {
    if(quizen.length >= 1){
        //er is nog een quiz dus we resetten gewoon
        let num = getRandomInt(0, quizen.length - 1);
        quiz = quizen[num];
        quizen.splice(num, 1);
        initQuiz();
    }else{
        //er is geen quiz meer.. dus opnieuw kiezen
        questionBox.style.display = "none";
        chooseBox.style.display = "block";
        resultBox.style.display = "none";
        nameBox.style.display = "none";
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}