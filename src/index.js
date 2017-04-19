'use strict';
var Alexa = require('alexa-sdk');
// var http = require('http');

var APP_ID = undefined;

//CONSTANTS
var letterNotPresent = 'I\'m sorry, that letter is not in there';
var letterPresent = 'That letter is in location ';
var letterPresentMoreThanOne = 'That letter is in the following spots: ';
var victory = 'Congratulations, you got the word ';
var loss = 'Sorry, you got guessed too many incorrect letters. The word was: ';
var MAX_INCORRECT = 6;

var randomWord = 'potato';
var lettersTried = [];
var guessedSoFar;
var incorrectGuesses = 0;
var gameStarted = false;
var output = '';

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
	// 'NewSession': function() {
// 		this.handler.state = states.STARTMODE;
// 	},
//     'LaunchRequest': function () {
//         this.emit('NewSession');
//     },
    'CheckLetterIntent': function () {
    	var letterGuess = this.event.request.intent.slots.letter.value;
        startGameIfNotStarted();
        checkForWin();
        var indices = checkLetter(letterGuess[0].toLowerCase());
        if (checkForLoss()){
        	this.emit(':tell', loss + randomWord); 
        }
        else if (checkForWin()){
        	incorrectGuesses = 0;
        	gameStarted = false;
        	this.emit(':tell', output, output);
        }
        else {
        	if (indices.length === 0) {
				setLetterNotPresentMessage();
			} else {
				setLetterPresentMessage(indices);
			}
			this.emit(':ask', output, 'guess another');
        }
    },
    'CheckGuessIntent': function () {
        this.emit(':ask', 'Hello World!');
    },
    'SessionEndedRequest': function () {
        this.emit('AMAZON.StopIntent');
    }
};

//stars the game and initializes array to length
function startGame(){
	guessedSoFar = new Array(randomWord.length);
	gameStarted = true;
};

//starts the game to persist it
function startGameIfNotStarted(){
	if (!gameStarted) {
        	startGame();
    }
}

//get locations in the word where the given letter appears
function getindicesOfLetterInWord(letter) {
	var indices = [];
	for (var i = 0; i < randomWord.length; i++){
		if (letter == randomWord.charAt(i)){
			indices.push(i+1);
			guessedSoFar[i] = letter;
		}
	}
	return indices;
}

//add letters to array of tried letters
function addTriedLetter(letter) {
	lettersTried.push(letter);
}

//check if letter is in word and return indices
function checkLetter(letter) {
	console.log('checking for letter - ' + letter); 
	var indices = getindicesOfLetterInWord(letter);
	if (indices.length === 0) {
		incorrectGuesses++;
		console.log(incorrectGuesses + ' incorrect guesses'); 
	}
	if (lettersTried.indexOf(letter) === -1) {
		addTriedLetter(letter);
	}
	return indices;
}

//returns if guess matches the random word
function checkGuessWord(word) {
	if (randomWord === word) {
		return true;
	} else {
		return false;
	}
}

//returns if all letters in array match random word
function checkAllLettersGuessed() {
	return checkGuessWord(guessedSoFar.join(''));
}

//checks if the player loses
function checkForLoss() {
	if (incorrectGuesses >= MAX_INCORRECT) {
		return true;
	} else {
		return false;
	}
}

//checks if there is victory and sets output
function checkForWin() {
	if (checkAllLettersGuessed()) {
        output = victory.concat(randomWord);
		return true;
    } else {
    	return false;
    }
}

//sets letter present message whether one or more
function setLetterPresentMessage(indices) {
	output = letterPresent;
    if (indices.length === 1){
    	output = letterPresent + indices[0];
    } else {
    	output = letterPresentMoreThanOne;
		for (var i of indices) {
			output += i + ',';
		}
    }
}

//sets letter not present message
function setLetterNotPresentMessage() {
	output = letterNotPresent;
}


//TODO - get random word from internet
// http.get('http://randomword.setgetgo.com/get.php', function(res) {
// 	var randomWord = res;
// 	console.log(randomWord);
// }, function(err) {
// 	console.log('error', err);
// });

