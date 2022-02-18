function updateData(chart, data) {
    chart.data.datasets[0].data = data;
    chart.update();
}

function updatePoseData(results) {
    poseData.total = poseData.total.map(el => el + 1);

    let good = !(
        !results.earsVisible ||
        !results.eyesGoodAngle ||
        !results.noseBetweenEars ||
        !results.shouldersGoodAngle
    );

    poseData.counter[0] += !results.earsVisible;
    poseData.counter[1] += !results.eyesGoodAngle;
    poseData.counter[2] += !results.noseBetweenEars;
    poseData.counter[3] += !results.shouldersGoodAngle;
    poseData.counter[4] += good;

    poseData.percent = [0, 0, 0, 0, 0].map((el, i) =>
        poseData.counter[i] / poseData.total[i]
    );
}

const poseData = {
    counter: [0, 0, 0, 0, 0],
    total: [1, 1, 1, 1, 1],
    percent: [0, 0, 0, 0, 0]
};

const data = {
    labels: [
        'face not facing the screen',
        'head is slanted',
        'head is lowered/raised',
        'shoulders are slanted',
        'good',
    ],
    datasets: [{
        label: '% of time',
        data: [0, 0, 0, 0, 0],
        fill: true,
        backgroundColor:'#66CCFF',
        borderColor: '#003399',
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(255, 99, 132)'
    }]
};

const images = [
    'images/icons/headTurned.png',
    'images/icons/headSlanted.png',
    'images/icons/headLowered.png',
    'images/icons/shouldersSlanted.png',
    'images/icons/good.png',
]

const config = {
    plugins: [{
        afterDraw: chart => {
            var ctx = chart.ctx;
            var yAxis = chart.scales['y'];
            var h = yAxis.getPixelForTick(1) - yAxis.getPixelForTick(0);
            yAxis.ticks.forEach((value, index) => {
                var y = yAxis.getPixelForTick(index);
                var img = new Image();
                img.src = images[index],
                    ctx.drawImage(img, 0, 0, img.width, img.height, 10, y - 16, h, h);
            });
        }
    }],
    type: 'bar',
    data: data,
    responsive: true,
    maintainAspectRatio: false,
    options: {
        indexAxis: 'y',
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    display: false
                }
            },
            x: {
                ticks: {
                    min: 0,
                    max: 100, // Your absolute max value
                    callback: function (value) {
                        return (value * 100).toFixed(0) + '%'; // convert it to percentage
                    },
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Percentage',
                },
            },
        },
        legend: {
            display: true,
            position: 'bottom',
            labels: {
                fontColor: "#000080",
            }
        },
        tooltips: {
            callbacks: {
                label: function (tooltipItem) {
                    return tooltipItem.yLabel;
                }
            }
        },
    },
};
