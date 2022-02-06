function $(querySelector, element = document){
    return element.querySelector(querySelector);
}

async function setupWebcam(videoEl) {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const webcamStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: 'user', // 'user' or 'environment'
            },
        })
        if ('srcObject' in videoEl) {
            videoEl.srcObject = webcamStream
        } else {
            videoEl.src = window.URL.createObjectURL(webcamStream)
        }
        return new Promise((resolve, _) => {
            videoEl.onloadedmetadata = () => {
                videoEl.width = videoEl.clientWidth
                videoEl.height = videoEl.clientHeight

                const imgWidth = videoEl.clientWidth
                const imgHeight = videoEl.clientHeight
                
                resolve([imgHeight, imgWidth])
            }
        })
    } else {
        alert('Нет вебкамеры - извините!')
    }
}



function loadModel([height, width]){
    const params = {
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: width, height: height },
        multiplier: 0.75
    }
    
    return posenet.load(params)
}

async function getKeyPoints(image, model){
    const pose = await model.estimateSinglePose(image, {
        flipHorizontal: false
    })
    
    return pose
}

function getRusVoice(voices){
	for(let i in voices){
		if(voices[i].lang.indexOf("ru") + 1){
			return voices[i];
		}
	}
	return null;
}

function say(text, lang="ru"){
    
    const voices = speechSynthesis.getVoices();
    if(voices.length > 0){
        const tts = new SpeechSynthesisUtterance(text);
    
        if(lang == "ru"){
            tts.lang = "ru-RU";
        }

        if(!window.speechSynthesis.speaking){
            return window.speechSynthesis.speak(tts);
        }
    }
}

function gradient(p1, p2){
    return (p1.y - p2.y) / (p1.x - p2.x);
}

function checkPose(pose) {
    let rightEye = pose.keypoints[2].position;
    let leftEye = pose.keypoints[1].position;
    let rightShoulder = pose.keypoints[6].position;
    let leftShoulder = pose.keypoints[5].position;
    let rightWrist = pose.keypoints[10].position;
    let leftWrist = pose.keypoints[9].position;
    let rightKnee = pose.keypoints[14].position;
    let leftKnee = pose.keypoints[13].position;
    let rightAnkle = pose.keypoints[16].position;
    let leftAnkle = pose.keypoints[15].position;

    let eyes = Math.abs(gradient(rightEye, leftEye)) < .1
    let shoulders = Math.abs(gradient(rightShoulder, leftShoulder)) < .1

    if (eyes && shoulders) {
        y1 = (rightEye.y + leftEye.y) / 2
        y2 = (rightShoulder.y + leftShoulder.y) / 2
        
        if(Math.abs(y1 - y2) > 50){
            say("нормально сидишь")
        }
        else{
            say("подними голову")
        }
    }
    else if(!eyes && shoulders){
        say("поправь голову")
    }
    else if(eyes && !shoulders){
        say("поправь плечи")
    }
    else if(!eyes && !shoulders){
        say("сядь как человек")
    }
}

async function performDetections(model, camera, [imgHeight, imgWidth]){
    const pose = await getKeyPoints(camera, model);

    console.log(pose)
    checkPose(pose);
}


let model, stop = false;
async function doStuff() {
    try {
        const camera = document.getElementById('camera')
        const camDetails = await setupWebcam(camera)
        model = await loadModel(camDetails)

        const interval = setInterval(() => {
           requestAnimationFrame(() => {
                performDetections(model, camera, camDetails).then(() => {
                    if(stop){
                        tf.dispose([model]);
                        clearInterval(interval);
                    }
                });
           })
        }, 300);

    } catch (e) {
        console.error(e)
    }
}