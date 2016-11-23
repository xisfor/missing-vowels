
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var voice_data = {
  grammar: '',
  is_talker: false,
  recognition: new SpeechRecognition(),
};


Vue.component('voice-recogniser', {
  template: '<a class="btn btn-lg btn-primary" id="speech" v-on:click="listenUp">Say it!</a>',
  props: {
    terms: null
  },
  data: function () {
    return voice_data;
  },
  methods: {
    listenUp: function () {
      voice_data.recognition.start();
      console.log('I\'m listening');
    }
  },
  ready: function () {
    console.log('voice ready');

    // setGrammars();
    runSpeechRecognition();
  }
});

// this.recognition.stop();


//----
var diagnostic = document.querySelector('.output');

// function setGrammars () {
//   var terms = vm.rounds.map(function (round) { return round.term; });
//   voice_data.grammar = '#JSGF V1.0; grammar gameGrammar; public <gameTerms> = ' + terms.join(' | ') + ' ;';
//   console.log(voice_data.grammar);
// }

function runSpeechRecognition () {
  var self = voice_data;

  // var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
  // var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
  // var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

  // self.recognition = new SpeechRecognition();
  // var speechRecognitionList = new SpeechGrammarList();
  // speechRecognitionList.addFromString(self.grammar, 1);
  // self.recognition.grammars = speechRecognitionList;

  //recognition.continuous = false;

  self.recognition.lang = 'en-GB';
  self.recognition.interimResults = false;
  self.recognition.maxAlternatives = 1;
}


voice_data.recognition.onresult = function (event) {
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

  diagnostic.textContent = 'I think you said: ' + word + '.';
  // console.log(word);
  // console.log('Confidence: ' + event.results[0][0].confidence);

  vm.turn.guess = word;
  vm.attempt();
};

voice_data.recognition.onspeechend = function () {
  // console.log('speech end');
  voice_data.recognition.stop();
};

voice_data.recognition.onnomatch = function (event) {
  // console.log('no match');
  diagnostic.textContent = "I didn't recognise that word.";
};

voice_data.recognition.onerror = function (event) {
  console.log('error', event);
  // diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
};


