function updateData(chart, data) {
    chart.data.datasets[0].data = data;
    chart.update();
}

function updatePoseData(results){
    poseData.total = poseData.total.map(el => el+1);

    poseData.bad[0] += !results.earsVisible;
    poseData.bad[1] += !results.eyesGoodAngle;
    poseData.bad[2] += !results.noseBetweenEars;
    poseData.bad[3] += !results.shouldersGoodAngle;

    poseData.percent = [0,0,0,0].map((el, i) => 
        poseData.bad[i] / poseData.total[i]
    );
    poseData.percent.push(1);
}

const poseData = {
    bad: [0, 0, 0, 0],
    total: [1, 1, 1, 1],
    percent: [0, 0, 0, 0]
};

const data = {
    labels: [
        'лицо смотрит не на экран',
        'голова не выпрямлена',
        'голова поднята/опущена',
        'плечи кривые',
        ''
    ],
    datasets: [{
        label: 'ваши статы',
        data: [0, 0, 0, 0],
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
    type: 'bar',
    data: data,
    responsive: true,
    maintainAspectRatio: false,
    options: {
        indexAxis: 'y',
        scales: {
            y: {
                beginAtZero: true
            }
        },
        legend: {
            display: false
        },
        tooltips: {
            callbacks: {
                label: function(tooltipItem) {
                    return tooltipItem.yLabel;
                }
            }
        },
    },
};
