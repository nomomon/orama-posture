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
            var interval = xAxis.width / yAxis.ticks.length;
            var h = 40;
            yAxis.ticks.forEach((value, index) => {
                var img = new Image();
                img.src = images[index];
                var w = img.width / img.height * h;

                var img_x = (index + 1) * interval - w/2;
                var img_y = yAxis.bottom + h+10 - h/2;
                
                var text_x = (index + 1) * interval - 16/2 - w/2;
                var text_y = yAxis.bottom + h+10;

                ctx.fillText(index+1+".", text_x, text_y);
                ctx.drawImage(img, 0, 0, img.width, img.height, img_x, img_y, w, h);
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
                bottom: 40
            }
        },
        indexAxis: 'y',
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    display: true,
                    callback: function (value, index) {
                        return index + 1;
                    },
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

const today = (()=>{
    let date = new Date(),
        day = ('0' + date.getDate()).slice(-2),
        month = ('0' + (date.getMonth() + 1)).slice(-2),
        year = date.getFullYear();
    return `${year}.${month}.${day}`;
})();

if(!localStorage.getItem(today)){
    localStorage.setItem(today, JSON.stringify({}));
}
qualityTodayMemory = JSON.parse(localStorage.getItem(today));

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
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            // x: [{
            //     type: "time",
            //     distribution: "linear"
            // }],
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