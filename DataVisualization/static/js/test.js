var chart,
    chartOptions = {},
    chartData = {};

chartData.chart1 = randomData(25);
chartData.chart2 = randomData(10, true);
chartData.chart3 = randomData(65, true, 300);

chartOptions.chart1 = {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Chart 1 Title'
    },
    yAxis: {
        title: {
            text: 'Chart 1<br/>Y Axis'
        }
    },
    series: [{
        name: 'Chart 1 Series',
        data: chartData.chart1
    }]
};
chartOptions.chart2 = {
    chart: {
        type: 'bar',
        marginLeft: 120
    },
    title: {
        text: 'Chart 2 Title'
    },
    xAxis: {
        categories: alphaCats(10),
        labels: {
            style: {
                fontWeight: 'bold'
            }
        },
        title: {
            margin: 50
        }
    },
    yAxis: {
        title: {
            text: 'Chart 2<br/>Y Axis'
        }
    },
    series: [{
        name: 'Chart 2 Series',
        data: chartData.chart2
    }]
};
chartOptions.chart3 = {
    chart: {
        type: 'line'
    },
    title: {
        text: 'Chart 3 Title'
    },
    yAxis: {
        title: {
            text: 'Chart 3<br/>Y Axis'
        }
    },
    series: [{
        name: 'Chart 3 Series',
        data: chartData.chart3
    }]
};


$(function () {

    //common options
    Highcharts.setOptions({
        chart: {
            marginRight: 100
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            y: 50
        },
        plotOptions: {
            bar: {
                pointPadding: .01
            },
            column: {
                borderWidth: 0.5
            },
            line: {
                lineWidth: 1
            }

        }
    });

    $('#container').highcharts(chartOptions.chart1);
    chart = $('#container').highcharts();

    $(document).on('click', '.chart-update', function () {
        $('button').removeClass('selected');
        $(this).addClass('selected');
        chart.destroy();
        console.log("hola")
        $('#container').highcharts(chartOptions[$(this).data('chartName')]);
        chart = $('#container').highcharts();
    });


});

//generate chart data
function randomData(points, positive, multiplier, type) {
    var chartData = [];
    for (var i = 0; i < points; i++) {
        if (type == 'scatter') {
            var dataNodes = randomNormData(2, positive, multiplier);
            var dataPoint = [
                dataNodes[0],
                dataNodes[1],
            ];
        } else if (type == 'bubble') {
            var dataPoint = [
                randomNormData(1, positive, multiplier),
                randomNormData(1, positive, multiplier),
                randomNormData(1, true, multiplier)
            ];
        } else if (type == 'columnrange' || type == 'arearange' || type == 'areasplinerange' || type == 'errorbar') {
            var dataNodes = randomNormData(2, positive, multiplier);
            dataNodes.sort(numSort);
            var dataPoint = {
                'low': dataNodes[0],
                'high': dataNodes[1]
            };
        } else if (type == 'boxplot') {
            var dataNodes = randomNormData(5, positive, multiplier);
            dataNodes.sort(numSort);
            var dataPoint = {
                'low': dataNodes[0],
                'q1': dataNodes[1],
                'median': dataNodes[2],
                'q3': dataNodes[3],
                'high': dataNodes[4]
            };
        } else {
            var dataPoint = randomNormData(1, positive, multiplier);
        }
        chartData.push(dataPoint);
    }
    //console.log(chartData);
    return chartData;
}

//random normal data
function randomNormData(points, positive, multiplier) {
    points = !points ? 1 : points;
    positive = positive == 'neg' ? 'neg' : (positive === true ? true : false);
    multiplier = !multiplier ? 1 : multiplier;

    function rnd() {
        return ((
            Math.random() +
            Math.random() +
            Math.random() +
            Math.random() +
            Math.random() +
            Math.random()
        ) - 3) / 3;
    }

    var rData = points > 1 ? [] : null;
    for (var i = 0; i < points; i++) {
        val = rnd();
        val = positive === true ? Math.abs(val) : (positive == 'neg' ? (0 - Math.abs(val)) : val);
        val = multiplier > 1 ? (val * multiplier) : val;
        if (points > 1) {
            rData.push(val);
        } else {
            rData = val;
        }
    }
    return rData;
}

//sorting
function numSort(a, b) {
    return a - b;
}

function numSortR(a, b) {
    return b - a;
}

//category filler
function alphaCats(n) {
    var alph = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    var cats = [];
    for (var i = 0; i < n; i++) {
        if (i < alph.length) {
            cats.push(alph[i]);
        } else {
            var rep = Math.ceil((i / (alph.length - 1)));
            var c = (Math.ceil(i / (rep - 1)) - alph.length);
            var cat = '';
            for (var j = 0; j < rep; j++) {
                cat = cat + alph[c];
            }
            cats.push(cat);
        }
    }
    return cats;
}

var monthCats = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var dayCats5 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
var dayCats7 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function genericSort(index, arr) {
    array.sort(
        function (a, b) {
            return a[index] < b[index]
        }
    )
}