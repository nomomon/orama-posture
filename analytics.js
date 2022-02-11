// <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.0/chart.min.js"></script>

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