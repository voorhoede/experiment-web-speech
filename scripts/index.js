"use strict";

const speechRecognition =
  !!window.SpeechRecognition || !!window.webkitSpeechRecognition
    ? new (window.SpeechRecognition || window.webkitSpeechRecognition)()
    : false;

const commands = {};
const searchInput = document.getElementById("search-input");

if (speechRecognition) {
  speechRecognition.lang = "en-US";
  speechRecognition.continuous = true;
  speechRecognition.interimResults = false;
}

function addCommand(command, callBack) {
  console.log(`Register '${command}' command.`);
  commands[command] = callBack;
}

function onSpeechRecognitionEvents() {
  speechRecognition.addEventListener("start", () => {
    console.log(`Start listening to the user.`);
  });

  speechRecognition.addEventListener("error", event => {
    console.log(`Woops! Something went wrong: ${event.error}`);
  });

  speechRecognition.addEventListener("end", () => {
    console.log(`Stop listening to the user.`);
    speechRecognition.start();
  });

  speechRecognition.addEventListener("result", event => {
    if (typeof event.results === "undefined") return;
    const transcript = event.results[event.results.length - 1][0].transcript
      .toLowerCase()
      .trim();

    console.log(`Transcribed Message: ${transcript}.`);

    for (let command in commands) {
      if (transcript.indexOf(command) === 0) {
        console.log(`Execute '${command}' command.`);
        if (transcript[command.length] === undefined) {
          commands[command]();
        } else {
          const param = transcript
            .substring(command.length, transcript.length)
            .trim();
          commands[command](param);
        }
      }
    }
  });
}

if (speechRecognition) {
  onSpeechRecognitionEvents();

  addCommand("search for", params => {
    if (params) searchInput.value = params;
  });

  addCommand("go to", params => {
    if (params === "home" || params === "homepage") window.location.href = "/";
    if (params === "contact") window.location.href = "/contact";
    if (params === "blog") window.location.href = "/blog";
  });

  addCommand("navigate to", params => {
    if (params === "home" || params === "homepage") window.location.href = "/";
    if (params === "contact") window.location.href = "/contact";
    if (params === "blog") window.location.href = "/blog";
  });

  speechRecognition.start();
}
