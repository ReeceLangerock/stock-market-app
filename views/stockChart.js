let stockChart; // save reference to chartjs chart

function drawChart(labels, dataset) {
    // if no stocks need to be drawn at page load, empty the dataset arrays
    if (labels == '' && dataset == '') {
        labels = [];
        dataset = [];
    }
    //create the chart
    var ctx = document.getElementById("stock-chart");
    stockChart = new Chart(ctx, {
        type: 'line',
        responsive: true,
        maintainAspectRatio: false,
        data: {
            labels: labels,
            datasets: dataset
        },
        options: {
            // title on top of chart
            title: {
                fontSize: 30,
                display: true,
                text: 'Stocks'
            },
            hover: {
                mode: 'dataset',
                intersect: false
            },
            // format y axis
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Stock Price'
                    },
                    // callback solution taken from:
                    // http://stackoverflow.com/questions/28523394/charts-js-formatting-y-axis-with-both-currency-and-thousands-separator
                    ticks: {
                        callback: function(value, index, values) {
                            if (parseInt(value) >= 1000) {
                                return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            } else {
                                return '$' + value;
                            }
                        }
                    }
                }],
                //format x axis with time data
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'month'
                    },
                    ticks: {
                        fontSize: 10,
                    }
                }]
            }
        }
    });

}

function redrawChart(response) {
    // format response into label/dataset for chart
    var labels = [];
    var prices = [];
    for (let i = response.dataset.data.length - 1; i > 0; i--) {
        labels.push(response.dataset.data[i][0]);
    }
    for (let i = 0; i < response.dataset.data.length; i++) {
        prices.push(response.dataset.data[i][1]);
    }
    // push formatted response into the chart
    stockChart.data.labels = labels;
    stockChart.data.datasets.push({
        fill: false,
        pointRadius: 0,
        pointHitRadius: 30,
        borderColor: generateRandomColor(),
        label: response.dataset.dataset_code,
        data: prices
    })
    stockChart.update();
}

function addStockToChart() {
    var stockCode = document.getElementById('addStock').value;
    // get the stock code the user entered and send it to the server
    sendPostForStockData(stockCode).then(function(response, error) {
        // if stock has already been added, display that to user
        if (response == 'duplicate stock') {
            document.getElementById('stockResponseDisplay').innerHTML = "That stock has already been added";
        }
        // if stock code doesn't exist, display that to user
        else if (response == 'wrong stock') {
            document.getElementById('stockResponseDisplay').innerHTML = "Incorrect or non-existent stock code";
        } else { // otherwise, make sure the response area is empty
            document.getElementById('stockResponseDisplay').innerHTML = "";
        }
    })
}

function removeStock(stockToRemove) {
    // send the stock code of the stock the user selected to remove to the server
    var xhr = new XMLHttpRequest();
    var url = "/removeStockCode";

    // not sure if this is needed, response is handled by server socket emit
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log('removed');
        } else if (xhr.status == '404') {
            console.log('404');
        }
    }
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify({
        'stockCode': stockToRemove.id
    }));

}

function sendPostForStockData(stockCode) {
    // send a stock code to the server, to check if it exists
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        var url = "/addStockCode";

        // return server response
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                resolve(xhr.responseText);
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

function removeFromChart(stockToRemove) {
    // find the index of the stock to remove in the chart dataset
    var index;
    for (let i = 0; i < stockChart.data.datasets.length; i++) {
        if (stockChart.data.datasets[i].label == stockToRemove) {
            index = i;
        }
    }
    //remove appropriate stock and update chart
    stockChart.data.datasets.splice(index, 1);
    stockChart.update();
}

// generate reandom hex code for stock dataset lines
function generateRandomColor() {
    var letters = '0123456789ABCDEF';
    var hex = '#';
    for (var i = 0; i < 6; i++) {
        hex += letters[Math.floor(Math.random() * 16)];
    }
    return hex;
}
