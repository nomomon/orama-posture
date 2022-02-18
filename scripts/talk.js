function getRusVoice(voices){
	for(let i in voices){
		if(voices[i].lang.indexOf("ru") + 1){
			return voices[i];
		}
	}
	return null;
}

function say(text, lang="en"){
    const voices = speechSynthesis.getVoices();
    if(voices.length > 0){
        const tts = new SpeechSynthesisUtterance(text);
    
        if(lang == "ru"){
            tts.lang = "ru-RU";
        }else if(lang == "en"){
            tts.lang = "en-US"
        }

        if(!window.speechSynthesis.speaking && settings.voiceAssistant){
            return window.speechSynthesis.speak(tts);
        }
    }
}