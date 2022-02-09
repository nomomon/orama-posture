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
                
                const detection = document.getElementById('detection')
                const ctx = detection.getContext('2d')
                detection.width = imgWidth
                detection.height = imgHeight

                resolve([ctx, imgHeight, imgWidth])
            }
        })
    } else {
        alert('Нет вебкамеры - извините!')
    }
}



function loadModel([ctx, height, width]){
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
        flipHorizontal: true
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
    let threshold = 0.5;

    let nose = pose.keypoints[0],
        rightEye = pose.keypoints[2], 
        leftEye = pose.keypoints[1], 
        rightEar = pose.keypoints[4],
        leftEar = pose.keypoints[3], 
        rightShoulder = pose.keypoints[6], 
        leftShoulder = pose.keypoints[5];

    let eyesGradient = gradient(rightEye.position, leftEye.position),
        shouldersGradient = gradient(rightShoulder.position, leftShoulder.position);

    let eyesGoodAngle = Math.abs(eyesGradient) < 0.1,
        shouldersGoodAngle = Math.abs(shouldersGradient) < 0.1;
    
    let noseVisible = nose.score > threshold,
        eyesVisible = rightEye.score > threshold && leftEye.score > threshold,
        earsVisible = rightEar.score > threshold && leftEar.score > threshold,
        shouldersVisible = rightShoulder.score > threshold && leftShoulder.score > threshold;

    let noseEar = (rightEar.position.y + leftEar.position.y) / 2 - nose.position.y,
        noseBetweenEars = Math.abs(noseEar) < 20;

    let positionNowGood = eyesVisible && 
                          eyesGoodAngle &&
                          noseBetweenEars &&
                          !(shouldersVisible && !shouldersGoodAngle);
    
    if(positionNowGood && !window.speechSynthesis.speaking && !said){
        say("вы хорошо сидите");
        said = true;
    }else if(!positionNowGood){
        said = false;
        
        if(eyesVisible && !eyesGoodAngle){
            say("выпрямите голову");
        }
        if(noseVisible && earsVisible && !noseBetweenEars){
            if(noseEar < 0){
                say("поднимите лицо");
            }else{
                say("опустите лицо");
            }
        }
        if(!earsVisible){
            if(rightEar.score < threshold && leftEar.score > threshold){
                say("поверните лицо левее")
            }
            if(rightEar.score > threshold && leftEar.score < threshold){
                say("поверните лицо правее")
            }
        }
        if(shouldersVisible && !shouldersGoodAngle){
            say("выровняйте плечи")
        }
    }
}

function drawPoints(pose, ctx, threshold = 0.5){
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.scale(-1,1);
    
    let radius = 5;

    pose.keypoints.forEach(point => {
        if(point.score > threshold){
            ctx.beginPath();
            ctx.arc(point.position.x, point.position.y, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'green';
            ctx.fill();
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#003300';
            ctx.stroke();
        }
    });

}

async function performDetections(model, camera, [ctx, imgHeight, imgWidth]){
    const pose = await getKeyPoints(camera, model);
    console.log(pose);

    checkPose(pose);
    drawPoints(pose, ctx);
}


let model, stop = false, said = false;
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