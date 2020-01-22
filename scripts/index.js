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

  function navigateTo(params) {
    if (params === "home" || params === "homepage") window.location.href = "/";
    else if (params === "contact") window.location.href = "/pages/contact.html";
    else if (params === "blog") window.location.href = "/pages/blog.html";
    else console.log(`'${params}' is not a valid option.`);
  }

  addCommand("search for", params => {
    if (params) searchInput.value = params;
  });

  addCommand("navigate to", params => {
    navigateTo(params);
  });

  addCommand("go to", params => {
    navigateTo(params);
  });

  speechRecognition.start();
}
