function updateData(chart, data, labels = 0) {
    chart.data.datasets[0].data = data;
    if(labels != 0){
        chart.data.labels = labels;
    }
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
        poseData.counter[i] / poseData.total[i] * 100
    );

    sumOfQualities += good;
    totalQualities += 1;
}

const poseData = {
    counter: [0, 0, 0, 0, 0],
    total: [1, 1, 1, 1, 1],
    percent: [0, 0, 0, 0, 0]
};

const data = {
    labels: [
        'Face not facing the screen',
        'Head is slanted',
        'Head is lowered/raised',
        'Shoulders are slanted',
        'Good',
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
        pointHoverBorderColor: 'rgb(255, 99, 132)',
        minBarLength: 3
    }]
};

const images = [
    'images/icons/headTurned.png',
    'images/icons/headSlanted.png',
    'images/icons/headLowered.png',
    'images/icons/shouldersSlanted.png',
    'images/icons/good.png',
]

const barChartConfig = {
    plugins: [{
        afterDraw: chart => {
            var ctx = chart.ctx;
            var xAxis = chart.scales['x'];
            var yAxis = chart.scales['y'];
            var h = yAxis.getPixelForTick(1) - yAxis.getPixelForTick(0);
            yAxis.ticks.forEach((value, index) => {
                var y = yAxis.getPixelForTick(index);
                var x = xAxis.left;
                var img = new Image();
                img.src = images[index];
                var w = img.width / img.height * h;
                ctx.drawImage(img, 0, 0, img.width, img.height, x - w*1.75, y - 0.5*h , w, h);
            });
        }
    }],
    type: 'bar',
    data: data,
    responsive: true,
    maintainAspectRatio: true,
    options: {
        layout: {
            padding: {
                left: 25
            }
        },
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
                        return (value).toFixed(0) + '%'; // convert it to percentage
                    },
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Percentage',
                }
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
/*-----------------------------------*/
let sumOfQualities = 0, totalQualities = 0, qualityTodayMemory;

if(!localStorage.getItem('today')){
    localStorage.setItem('today', JSON.stringify({}));
}
qualityTodayMemory = JSON.parse(localStorage.getItem('today'));

const minutesSeriesChartConfig = {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            data: qualityTodayMemory, // Set initially to empty data
            label: "Quality of Posture",
            borderColor: "#3e95cd",
            fill: false
        }]
    },
    options: {
        scales: {
            xAxes: [{
                type: "time",
                distribution: "linear"
            }],
            y: {
                ticks: {
                    min: 0,
                    max: 100, // Your absolute max value
                    callback: function (value) {
                        return (value).toFixed(0) + '%'; // convert it to percentage
                    },
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Percentage',
                },
            },
            title: {
                display: false
            }
        },
        elements: {
            line: {
                tension: 0.4
            }
        }
    }
};