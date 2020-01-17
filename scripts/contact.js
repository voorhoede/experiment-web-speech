"use strict";

const speechRecognition =
  !!window.SpeechRecognition || !!window.webkitSpeechRecognition
    ? new (window.SpeechRecognition || window.webkitSpeechRecognition)()
    : false;

const speechSynthesis = window.speechSynthesis || false;
const speechUtterance = !!window.SpeechSynthesisUtterance
  ? new window.SpeechSynthesisUtterance()
  : false;

let voices = [];
const interactionState = {
  isSpeaking: false,
  isListening: false
};

if (speechRecognition) {
  speechRecognition.lang = "en-US";
  speechRecognition.continuous = false;
  speechRecognition.interimResults = false;
}

function findGoogleVoice(voice) {
  /*
      Google Chrome has a strange bug that breaks the Speech Synthesis API.
      - The breaking of the utterances only happens when the voice is not a native voice.
      - The cutting out usually occurs between 200-300 characters.

      A workaround can be found here: https://stackoverflow.com/a/23808155
  */

  return voice.name.startsWith("Google US English");
}

function findMicrosoftVoice(voice) {
  return voice.name.startsWith("Microsoft Jessa Online");
}

function findDefaultVoice(voice) {
  return voice.default === true;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function speak(message) {
  if (speechSynthesis.speaking) speechSynthesis.cancel();
  speechUtterance.text = message;
  speechSynthesis.speak(speechUtterance);
}

function onSpeechRecognitionEvents() {
  speechRecognition.addEventListener("start", () => {
    console.log(`Start listening to the user.`);
    interactionState.isListening = true;
  });

  speechRecognition.addEventListener("error", () => {
    console.log(`Woops! Something went wrong: ${event.error}`);
    interactionState.isListening = false;
  });

  speechRecognition.addEventListener("end", () => {
    console.log(`Stop listening to the user`);
    interactionState.isListening = false;
  });

  speechRecognition.addEventListener("result", event => {
    interactionState.isListening = false;
    if (typeof event.results === "undefined") return;
    const transcript = capitalize(event.results[0][0].transcript.trim());
    console.log(`Transcribed Message: ${transcript}.`);
    document.activeElement.value = transcript;
  });
}

function onSpeechUtteranceEvents() {
  speechUtterance.addEventListener("start", () => {
    console.log(`Start speaking to the user.`);
    interactionState.isSpeaking = true;
  });

  speechUtterance.addEventListener("error", event => {
    console.log(`Woops! Something went wrong: ${event.error}`);
    interactionState.isSpeaking = false;
  });

  speechUtterance.addEventListener("end", () => {
    console.log(`Stop speaking to the user.`);
    interactionState.isSpeaking = false;
    speechRecognition.abort();
    speechRecognition.start();
  });
}

function onVoiceChange() {
  speechSynthesis.addEventListener("voiceschanged", () => {
    voices = speechSynthesis.getVoices();
    speechUtterance.voice =
      voices.find(findGoogleVoice) ||
      voices.find(findMicrosoftVoice) ||
      voices.find(findDefaultVoice);
    speechUtterance.lang = "en-US";
    speechUtterance.volume = 1;
    speechUtterance.pitch = 1;
    speechUtterance.rate = 1;
  });
}

function onFocusGain() {
  document.querySelectorAll("input").forEach(input => {
    input.addEventListener("focus", e => {
      interactionState.isSpeaking = true;
      interactionState.isListening = false;
      speak(e.target.parentElement.textContent);
    });
  });

  document.querySelectorAll("textarea").forEach(textarea => {
    textarea.addEventListener("focus", e => {
      interactionState.isSpeaking = true;
      interactionState.isListening = false;
      speak(e.target.parentElement.textContent);
    });
  });

  document.querySelectorAll("button").forEach(button => {
    button.addEventListener("focus", e => {
      interactionState.isSpeaking = true;
      interactionState.isListening = false;
      speak(e.target.textContent);
    });
  });
}

if (speechRecognition && speechSynthesis && speechUtterance) {
  onSpeechRecognitionEvents();
  onSpeechUtteranceEvents();
  onVoiceChange();
  onFocusGain();
}
