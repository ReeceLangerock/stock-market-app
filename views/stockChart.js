
function updateChart() {
    var stockCode = document.getElementById('stockCode').value;
    console.log(stockCode);
    sendPostForStockData(stockCode).then(function(response, error) {
        var labels = [];
        var prices = [];
        for (let i = response.length-1; i > 0; i--) {
            labels.push(response[i][0]);
            prices.push(response[i][1]);
        }
        drawChart(labels,prices);
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

function drawChart(labels, prices) {

    var ctx = document.getElementById("stock-chart");
    var myChart = new Chart(ctx, {
        type: 'line',
        responsive: true,
        maintainAspectRatio: false,
        data: {
            labels: labels,
            datasets: [{
                data: prices,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}
