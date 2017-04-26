'use strict';
var Alexa = require('alexa-sdk');
// var http = require('http');

var APP_ID = '';

//CONSTANTS
var letterNotPresent = 'That letter is not in there';
var letterPresent = 'That letter is in location: ';
var letterPresentMoreThanOne = 'That letter is in the following spots: ';
var victory = 'Congratulations, you got the word ';
var loss = 'You guessed too many incorrect letters. The word was: ';
var MAX_INCORRECT = 6;
var possibleWords = ['potato','truck','branch','wallet','mellon','kitty','program','store','peace','quarter',
						'quick','polite','herd','fancy','fake','stealthy','arrows','phantom','chain','contest',
						'smile','agenda','spell','dinner','humid','cube','thing','hamilton','paper','beehive',
						'cuddly','bumble','jigsaw','fabric','beam','chant','pulse','empire','curse','apricot'];
var randomWord;
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
    'LaunchRequest': function () {
        startGame();
		output = 'Welcome to hangman. Your word has ' + randomWord.length + ' letters';
		this.emit(':ask', output, 'guess a letter or word');
    },
    'CheckLetterIntent': function () {
		var letterGuess = this.event.request.intent.slots.letter.value[0].toLowerCase();
        startGame();
		checkLetter(letterGuess);
		if (checkForLoss()){
			resetGame();
			this.emit(':tell', loss + randomWord); 
		} else if (checkForWin()) {
			resetGame();
			this.emit(':tell', output, output);
		} else {
			var indices = getIndicesOfLetterInWord(letterGuess)
			if (indices.length === 0) {
				setLetterNotPresentMessage();
			} else {
				setLetterPresentMessage(indices);
			}
			this.emit(':ask', output, 'guess another');
		}
    },
    'CheckGuessIntent': function () {
		var wordGuess = this.event.request.intent.slots.wordGuess.value;
		console.log('word - ' + randomWord + ', guess - ' + wordGuess);
		if (typeof randomWord == 'undefined') {
			this.emit(':tell', 'You should start a game first.');
		} else if (wordGuess == randomWord) {
			resetGame();
        	this.emit(':tell', victory + randomWord);
		} else {
			this.emit(':ask', 'keep guessing');
		}
    },
    'SessionEndedRequest': function () {
        this.emit('AMAZON.StopIntent');
    }
};

//stars the game and initializes array to length
function startGame() {
	if (!gameStarted) {
		randomWord = possibleWords[Math.floor(Math.random()*possibleWords.length)]
		guessedSoFar = new Array(randomWord.length);
		gameStarted = true;
	}
}

//check if letter is in word and return indices
function checkLetter(letter) {
	var indices = getIndicesOfLetterInWord(letter);
	if (indices.length === 0) {
		incorrectGuesses++;
	}
	if (lettersTried.indexOf(letter) === -1) {
		addTriedLetter(letter);
	}
}

//get locations in the word where the given letter appears
function getIndicesOfLetterInWord(letter) {
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
    if (indices.length === 1) {
    	output = letterPresent + indices[0] + ' of ' + randomWord.length;
    } else {
    	output = letterPresentMoreThanOne;
		for (var i of indices) {
			output += i + ', ';
		}
		output += ' of ' + randomWord.length; 
    }
}

//sets letter not present message
function setLetterNotPresentMessage() {
	output = letterNotPresent;
}

//resets values after winning a game
function resetGame() {
	gameStarted = false;
	incorrectGuesses = 0;
}