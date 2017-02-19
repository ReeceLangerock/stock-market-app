let stockChart;

function updateChart() {
    var stockCode = document.getElementById('addStock').value;
    sendPostForStockData(stockCode).then(function(response, error) {

      if(response == 'duplicate stock'){
          document.getElementById('duplicateDisplay').innerHTML = "That stock has already been added";
      }
      else if(response == 'wrong stock'){
        document.getElementById('duplicateDisplay').innerHTML = "Incorrect or non-existent stock code";
      }
      else{
        document.getElementById('duplicateDisplay').innerHTML = "";
      }

    })
}

function removeStock(stockToRemove) {
    console.log(stockToRemove);
    var xhr = new XMLHttpRequest();
    var url = "/removeStockCode";

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
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        var url = "/addStockCode";
        //Send the proper header information along with the request

        xhr.onreadystatechange = function() { //Call a function when the state changes.
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

function redrawChart(response) {
    var labels = [];
    var prices = [];
    for (let i = response.dataset.data.length - 1; i > 0; i--) {
        labels.push(response.dataset.data[i][0]);
    }
    for (let i = 0; i < response.dataset.data.length; i++) {
        prices.push(response.dataset.data[i][1]);
    }

    stockChart.data.labels = labels;
    stockChart.data.datasets.push({
        fill: false,
        pointRadius: 0,
        pointHitRadius: 50,
        borderColor: generateRandomColor(),
        label: response.dataset.dataset_code,
        data: prices
    })
    stockChart.update();
}

function removeFromChart(stockToRemove) {
    var index;
    for (let i = 0; i < stockChart.data.datasets.length; i++) {
        if (stockChart.data.datasets[i].label == stockToRemove) {
            index = i;
        }
    }
    stockChart.data.datasets.splice(index, 1);
    stockChart.update();
}

function generateRandomColor() {
    var letters = '0123456789ABCDEF';
    var hex = '#';
    for (var i = 0; i < 6; i++) {
        hex += letters[Math.floor(Math.random() * 16)];
    }
    return hex;
}

function drawChart(labels, dataset) {
    if(labels == '' && dataset == ''){
      labels = [];
      dataset = [];
    }

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
            title: {
                fontSize: 30,
                display: true,
                text: 'Stocks'
            },
            hover: {
                // Overrides the global setting
                mode: 'dataset',
                intersect: false
            },
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
