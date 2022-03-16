const tf = require("@tensorflow/tfjs");
const posenet = require("@tensorflow-models/posenet");

function $(querySelector, element = document) {
    return element.querySelector(querySelector);
}

function roundTo(num, decimalPlaces) {
    let pow = Math.pow(10, decimalPlaces);
    return Math.round(num * pow) / pow;
}

function loadModel([ctx, height, width]) {
    const params = {
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: size, height: Math.round(size * (height / width)) },
        multiplier: 0.75
    }

    return posenet.load(params)
}

async function getKeyPoints(image, model) {
    resizeImage(image, size);

    const pose = await model.estimateSinglePose($('#cameraProjection'), {
        flipHorizontal: true
    })

    return pose
}

function resizeImage(imageEl, newWidth) {
    let canvas = $('#cameraProjection'), ctx = canvas.getContext('2d');

    canvas.width = 200;
    canvas.height = 150;
    ctx.drawImage(imageEl, 0, 0, 200, 150);
}

function gradient(p1, p2) {
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

    if (positionNowGood && !window.speechSynthesis.speaking && !said) {
        say("You are sitting good");
        said = true;
    } else if (!positionNowGood) {
        said = false;

        if (eyesVisible && !eyesGoodAngle) {
            say("straighten your head");
        }
        if (noseVisible && earsVisible && !noseBetweenEars) {
            if (noseEar < 0) {
                say("raise your head");
            } else {
                say("lower your head");
            }
        }
        if (!earsVisible) {
            if (rightEar.score < threshold && leftEar.score > threshold) {
                say("turn your face left")
            }
            if (rightEar.score > threshold && leftEar.score < threshold) {
                say("turn your face right")
            }
        }
        if (shouldersVisible && !shouldersGoodAngle) {
            say("straighten your shoulders")
        }
    }

    return {
        "eyesGoodAngle": !(eyesVisible && !eyesGoodAngle),
        "shouldersGoodAngle": !(shouldersVisible && !shouldersGoodAngle),
        "noseBetweenEars": !(noseVisible && earsVisible && !noseBetweenEars),
        "earsVisible": earsVisible,
        "time": new Date()
    }
}

function drawPoints(pose, ctx, threshold = 0.5) {
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    let radius = 5;
    let coef = ctx.canvas.width / size;

    if (settings.drawPoints)
        pose.keypoints.forEach(point => {
            if (point.score > threshold) {
                ctx.beginPath();
                ctx.arc(point.position.x * coef, point.position.y * coef, radius, 0, 2 * Math.PI, false);
                ctx.fillStyle = '#66CCFF';
                ctx.fill();
                ctx.lineWidth = 5;
                ctx.strokeStyle = '#003399';
                ctx.stroke();
            }
        });

}

async function performDetections(model, camera, [ctx, imgHeight, imgWidth]) {
    const pose = await getKeyPoints(camera, model);

    drawPoints(pose, ctx);

    const results = checkPose(pose);
    updatePoseData(results);
    updateData(barChart, poseData.percent)
}


let model, stop = false, said = false, size = 200;
async function doStuff() {
    try {
        const camera = $('#camera')
        const camDetails = await setupWebcam(camera)
        model = await loadModel(camDetails)

        const interval = setInterval(() => {
            if (!settings.programWorking) return 0;

            requestAnimationFrame(() => {
                performDetections(model, camera, camDetails).then(() => {
                    if (stop) {
                        tf.dispose([model]);
                        clearInterval(interval);
                    }
                });
            })

            timeInMinutes = roundTo(timeInMinutes + .005, 3) // 0.005 = 300 / 1000 / 60;

            // minute has passed
            if (roundTo(Math.trunc(timeInMinutes) - timeInMinutes, 3) == 0) {
                let date = new Date(),
                    hours = date.getHours(),
                    minutes = ('0' + date.getMinutes()).slice(-2);
                let time = `${hours}:${minutes}`;

                qualityTodayMemory[time] = (sumOfQualities / totalQualities) * 100 || 0;
                localStorage.setItem(today, JSON.stringify(qualityTodayMemory));

                let data = Object.values(qualityTodayMemory)
                let labels = Object.keys(qualityTodayMemory)

                updateData(minutesSeriesChart, data, labels);

                totalQualities = 0;
                sumOfQualities = 0;
            }

            updateClock();
        }, 300);

    } catch (e) {
        console.error(e)
    }
}

const barChart = new Chart(
    $('#bar_chart'),
    barChartConfig
);

const minutesSeriesChart = new Chart(
    $('#minute_series_chart'),
    minutesSeriesChartConfig
)