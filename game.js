var vm = new Vue({
  el: "#app",
  data: {
    rounds: [],
    round: 0,
    category_count: 0,
    category_max_length: 10,
    grammar: '',
    recognition: null,
    score: 0,
    time_remaining: 0,
    round_time_length: 60,
    turn: {
      category: '',
      term: '',
      clue: '',
      guess: '',
      correct: false
    },
    turns_taken: []
  },
  methods: {
    attempt: function (event) {

      if ( testGuess(this.turn.term, this.turn.guess) ) {
        this.turn.correct = true;
        document.getElementById('next').focus();
      } else {
        this.turn.correct = false;
        document.getElementById('guess').focus();
      }

    },

    nextRound: function (event) {
      this.recognition.stop();

      if (this.turn.correct) this.score++;

      // save the turn for review at the end
      if (this.turn.clue) {
        // clone that bad boy
        this.turns_taken.push(JSON.parse(JSON.stringify(this.turn)));
        // console.log('tt',this.turns_taken);
      }

      // clean up and set data for next turn
      this.turn.category = this.rounds[this.round].category;
      this.turn.term = this.rounds[this.round].term;
      this.turn.clue = prepareClue(this.turn.term);
      this.turn.guess = '';
      this.turn.correct = false;

      this.round++;

      var guess_elem = document.getElementById('guess');
      if (guess_elem) {
        guess_elem.focus();
      }
    },

    nextGame: function (event) {
      var self = this;

      // clear out the data
      self.turns_taken = [];
      self.score = 0;

      // Game length in seconds
      self.time_remaining = self.round_time_length;

      // don't start the clock until we have the data loaded in
      self.getGameData(function() {

        var game_timer = setInterval(function() {
          self.time_remaining--;
          if (self.time_remaining <= 0) {
            clearInterval(game_timer);
            self.time_remaining = 0;
          }
        }, 1000);

      });

    },

    prepGameRounds: function (data) {
      var self = this;

      // mix up the rounds.
      data.rounds = _.shuffle(data.rounds);

      // tidy up the format
      var rerounds = [];
      data.rounds.forEach(function (category) {

        // mix up the terms, select first 10? self.category_max_length
        category.terms = _.shuffle(category.terms);
        category.terms = _.slice(category.terms, 0, self.category_max_length);

        category.terms.forEach(function (term) {
          rerounds.push({
            category: category.category,
            term: term
          });
        });
      });

      this.rounds = this.rounds.concat(rerounds);

      // a term a second
      if (this.rounds.length < this.round_time_length) {
        this.getGameData();
      } else {

        if (!self.recognition) {
          setGrammars();
          runSpeechRecognition();
        }

        // console.log('rounds', this.rounds.length, this.rounds);
        this.nextRound();
      }
    },

    getGameData: function (callback) {
      var self = this;

      var game_files = _.shuffle([
        'animals',
        // 'christmas',
        'countries',
        'food',
        'media',
        'musical_instruments',
        'pp_version',
        'stuff',
        'rivers',
        'sports',
        // 'geography',
        // 'video_games',
        // 'words'
      ]);

      // console.log(game_files.pop())


      $.ajax({
        url: 'data/' + game_files.pop() + '.json',
        method: 'GET'
      })
      .done(function (data) {


        self.prepGameRounds(data);

      })
      .fail(function (error) {
        console.log('data load error', error);
      })
      .always(function () {

        if (callback) callback();
      })
      ;
    },



    listenUp: function () {
      this.recognition.start();
      console.log('I\'m listening');
    }


  },
  computed: {
    nextBtnText: function () {
      return this.turn.correct ? 'Next' : 'Give up';
    },
    isGameOver: function () {
      return this.time_remaining <= 0;
    },
    hasPriorRound: function () {
      return this.turns_taken.length > 0;
    },
    grammars: function () {
    }
  },
  ready: function () {
    this.getGameData();
  }
});

//----



//----

function setGrammars () {
  var terms = vm.rounds.map(function (round) { return round.term; });
  vm.grammar = '#JSGF V1.0; grammar gameGrammar; public <gameTerms> = ' + terms.join(' | ') + ' ;';
  console.log(vm.grammar);
}

function runSpeechRecognition () {
  var self = vm;

  console.log('start');

  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
  var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
  var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

  self.recognition = new SpeechRecognition();
  var speechRecognitionList = new SpeechGrammarList();
  speechRecognitionList.addFromString(self.grammar, 1);
  self.recognition.grammars = speechRecognitionList;

  //recognition.continuous = false;

  self.recognition.lang = 'en-GB';
  self.recognition.interimResults = false;
  self.recognition.maxAlternatives = 1;

  var diagnostic = document.querySelector('.output');


  // document.body.onclick = function() {
  //   self.recognition.start();
  //   console.log('Ready to receive a color command.');
  // };

  self.recognition.onresult = function(event) {
    console.log('result');

    // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
    // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
    // It has a getter so it can be accessed like an array
    // The [last] returns the SpeechRecognitionResult at the last position.
    // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
    // These also have getters so they can be accessed like arrays.
    // The [0] returns the SpeechRecognitionAlternative at position 0.
    // We then return the transcript property of the SpeechRecognitionAlternative object

    var last = event.results.length - 1;
    var word = event.results[last][0].transcript;

    diagnostic.textContent = 'Result received: ' + word + '.';
    console.log(word);
    console.log('Confidence: ' + event.results[0][0].confidence);

    self.turn.guess = word;
    self.attempt();
  };

  self.recognition.onspeechend = function() {
    console.log('speech end');
    self.recognition.stop();
  };

  self.recognition.onnomatch = function(event) {
    console.log('no match');
    diagnostic.textContent = "I didn't recognise that word.";
  };

  self.recognition.onerror = function(event) {
    console.log('error', event);
    diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
  };

}


//----



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
