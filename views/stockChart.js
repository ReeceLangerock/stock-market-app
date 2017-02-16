let stockChart;

function updateChart() {
    var stockCode = document.getElementById('stockCode').value;

    sendPostForStockData(stockCode).then(function(response, error) {

    })

}

function sendPostForStockData(stockCode) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        var url = "/addStockCode";
        //Send the proper header information along with the request

        xhr.onreadystatechange = function() { //Call a function when the state changes.
            if (xhr.readyState == 4 && xhr.status == 200) {
                resolve(JSON.parse(xhr.responseText));
            } else if (xhr.status == '404') {
                return reject('404');
            }
        }
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.send(JSON.stringify({
            'stockCode': stockCode
        }));

    })
}

function redrawChart(response) {
    var labels = [];
    var prices = [];
    console.log(response);
    for (let i = 0; i < response.dataset.data.length; i++) {

        labels.push(response.dataset.data[i][0]);
        prices.push(response.dataset.data[i][1]);
    }

    console.log(stockChart.data)
    stockChart.data.labels = labels;
    stockChart.data.datasets.push({
        label: response.dataset.dataset_code,  
        data: prices
    })
    stockChart.update();
}

function drawChart(labels, data) {

    var ctx = document.getElementById("stock-chart");
    stockChart = new Chart(ctx, {
        type: 'line',
        responsive: true,
        maintainAspectRatio: false,
        data: {
            labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
            datasets: [{
                data: [12, 19, 3, 5, 2, 3]
            }]
        },
    });
}
