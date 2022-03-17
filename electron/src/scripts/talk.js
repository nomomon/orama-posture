var tts = require('speech-synthesis');

function say(text, lang = "en") {
    if (!tts.speaking && settings.voiceAssistant) tts(text, "Alex");
}
