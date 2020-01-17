"use strict";

const speechSynthesis = window.speechSynthesis || false;
const speechUtterance = !!window.SpeechSynthesisUtterance
  ? new window.SpeechSynthesisUtterance()
  : false;

let voices = [];

const blogPost = document.getElementById("blog-post");
const playButton = document.getElementById("play-button");
const pauseButton = document.getElementById("pause-button");
const resumeButton = document.getElementById("resume-button");
const cancelButton = document.getElementById("cancel-button");

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

function onSpeechUtteranceEvents() {
  speechUtterance.addEventListener("start", () => {
    console.log(`Start speaking to the user.`);
  });

  speechUtterance.addEventListener("error", event => {
    console.log(`Woops! Something went wrong: ${event.error}`);
  });

  speechUtterance.addEventListener("end", () => {
    console.log(`Stop speaking to the user.`);
    cancelButton.disabled = true;
    resumeButton.disabled = true;
    pauseButton.disabled = true;
    playButton.disabled = false;
    speechSynthesis.cancel();
  });
}

function onPlay() {
  playButton.addEventListener("click", () => {
    let textToRead = "";
    const children = blogPost.children;

    for (let i = 0; i < children.length; i++) {
      textToRead += children[i].textContent.trim();
      if (!textToRead.endsWith(". ")) textToRead += ". ";
    }

    speechSynthesis.cancel();
    speechUtterance.text = textToRead;
    speechSynthesis.speak(speechUtterance);

    cancelButton.disabled = false;
    pauseButton.disabled = false;
    playButton.disabled = true;
  });
}

function onPause() {
  pauseButton.addEventListener("click", () => {
    console.log(`Pause speaking to the user.`);
    resumeButton.disabled = false;
    pauseButton.disabled = true;
    speechSynthesis.pause();
  });
}

function onResume() {
  resumeButton.addEventListener("click", () => {
    console.log(`Resume speaking to the user.`);
    resumeButton.disabled = true;
    pauseButton.disabled = false;
    speechSynthesis.resume();
  });
}

function onCancel() {
  cancelButton.addEventListener("click", () => {
    cancelButton.disabled = true;
    resumeButton.disabled = true;
    pauseButton.disabled = true;
    playButton.disabled = false;
    speechSynthesis.cancel();
  });
}

if (speechSynthesis && speechUtterance) {
  playButton.disabled = false;
  onSpeechUtteranceEvents();
  onVoiceChange();
  onCancel();
  onResume();
  onPause();
  onPlay();
}
