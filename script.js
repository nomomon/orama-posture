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

var rightEye, leftEye, defaultRightEyePosition = [], defaultLeftEyePosition = [];


function checkPose(pose) {
    rightEye = pose.keypoints[2].position;
    leftEye = pose.keypoints[1].position;

    // Position of eyes when a human opens experiment page. Start position.
    while (defaultRightEyePosition.length < 1) {
        defaultRightEyePosition.push(rightEye.y);
    }

    while (defaultLeftEyePosition.length < 1) {
        defaultLeftEyePosition.push(leftEye.y);
    }

    // Math.abs converts a negative number to a positive one
    if (Math.abs(rightEye.y - defaultRightEyePosition[0]) > 15) {
        console.log("криво сидишь")
    }

    if (Math.abs(rightEye.y - defaultRightEyePosition[0]) < 15) {
        console.log("нормально сидишь")
    }
}

async function performDetections(model, camera, [imgHeight, imgWidth]){
    const pose = await getKeyPoints(camera, model);

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