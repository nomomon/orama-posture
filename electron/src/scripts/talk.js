var tts = require('speech-synthesis');

function say(text, lang = "en") {
    if (!tts.speaking) tts(text, "Alex");
}
