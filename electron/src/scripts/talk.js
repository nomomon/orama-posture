var tts = require('speech-synthesis');

function say(text, lang = "en") {
    if (!tts.speaking && settings.voiceAssistant && !speechSynthesis.speaking) tts(text, "Alex");
}
