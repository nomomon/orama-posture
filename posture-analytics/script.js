function updatePoseData(pose) {
    let threshold = 0.5;

    let nose = pose.keypoints[0]
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
    
    let eyesVisible = rightEye.score > threshold && leftEye.score > threshold,
        shouldersVisible = rightShoulder.score > threshold && leftShoulder.score > threshold;

    let noseBetweenEyes = (rightEye.position.y + leftEye.position.y - nose.position.y) < 20;

    poseData.total = poseData.total.map(el => el+1);
    poseData.bad[0] += shouldersVisible && !shouldersGoodAngle;
    poseData.bad[1] += eyesVisible && !eyesGoodAngle;
    poseData.bad[2] += eyesVisible && !noseBetweenEyes;

    poseData.percent = [0,0,0].map((el, i) => 
        poseData.bad[i] / poseData.total[i]
    );
}

async function performDetections(model, camera, [ctx, imgHeight, imgWidth]) {
    const pose = await getKeyPoints(camera, model);
    console.log(pose);

    drawPoints(pose, ctx);
    updatePoseData(pose);
    updateData(myChart, poseData.percent)
}

function updateData(chart, data) {
    chart.data.datasets[0].data = data;
    chart.update();
}

const poseData = {
    bad: [0, 0, 0],
    total: [1, 1, 1],
    percent: [0, 0, 0]
};

const data = {
    labels: [
        'плечи кривые',
        'голова повернута',
        'голова поднята'
    ],
    datasets: [{
        label: 'ваши статы',
        data: [10, 10, 10],
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(255, 99, 132)'
    }]
};

const config = {
    type: 'radar',
    data: data,
    options: {
        elements: {
            line: {
                borderWidth: 3
            }
        }
    },
};

const myChart = new Chart(
    $('#chart'),
    config
);