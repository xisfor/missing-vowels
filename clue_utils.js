

function testGuess (term, guess) {
  return (cleanTerm(term) == cleanTerm(guess));
}

/* clue prep */

// polyfill
if (!String.prototype.splice) {
  String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
  };
}

function prepareClue (str) {
  str = str.toLowerCase();
  str = removePunctuation(str);
  str = removeVowels(str);
  str = removeSpaces(str);
  str = addSpaces(str);

  return str;
}

function cleanTerm (str) {
  str = str.toLowerCase();
  str = removePunctuation(str);

  return str;
}

// adds spaces in random positions
function addSpaces (str) {
  var spaces = Math.floor( str.length / 3 );

  for (var i = 0; i < spaces; i++) {
    str = str.splice(Math.floor(Math.random()*str.length), 0, ' ');
  }

  return str;
}

function removeSpaces (str) {
  return str.replace(/[ ]/gi, '');
}

function removeVowels (str) {
  return str.replace(/[aeiou]/gi, '');
}

function removePunctuation (str) {
  return str.replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g, '');
}
