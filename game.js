var vm = new Vue({
  el: "#app",
  data: {
    rounds: [],
    round: 0,
    category_count: 0,
    category_max_length: 10,
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
        // document.getElementById('next').focus();
        setTimeout(this.nextRound, 900);
      } else {
        this.turn.correct = false;
        document.getElementById('guess').focus();
      }
    },

    nextRound: function (event) {

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


  },
  computed: {
    nextBtnText: function () {
      return this.turn.correct ? 'Next' : 'Skip';
    },
    isGameOver: function () {
      return this.time_remaining <= 0;
    },
    hasPriorRound: function () {
      return this.turns_taken.length > 0;
    },
  },
  ready: function () {
    this.getGameData();
  }
});

