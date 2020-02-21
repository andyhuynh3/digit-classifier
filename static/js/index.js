
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const mouse = {x: 0, y: 0};

ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.lineWidth = 8;
ctx.color = "black";

function getColor(colour){ctx.strokeStyle = colour;}

function getSize(size){ctx.lineWidth = size;}

canvas.addEventListener('mousemove', function(e) {
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
}, false);

canvas.addEventListener('mousedown', e => {
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);
    canvas.addEventListener('mousemove', onPaint, false);
}, false);

canvas.addEventListener('mouseup', () => {
    canvas.removeEventListener('mousemove', onPaint, false);
    postResults();
}, false);

canvas.addEventListener("touchstart", function (e) {
    mousePos = getTouchPos(canvas, e);
    mouse.x = mousePos.x;
    mouse.y = mousePos.y;
    let mouseEvent = new MouseEvent("mousedown", {});
    canvas.dispatchEvent(mouseEvent);
}, false);

canvas.addEventListener("touchend", function (e) {
    let mouseEvent = new MouseEvent("mouseup", {});
    canvas.dispatchEvent(mouseEvent);
}, false);

canvas.addEventListener("touchmove", function (e) {
    let touch = e.touches[0];
    let mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.pageX,
        clientY: touch.pageY
    });
    canvas.dispatchEvent(mouseEvent);
}, false);

// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
        x: touchEvent.touches[0].clientX - rect.left,
        y: touchEvent.touches[0].clientY -  rect.top
    };
}

document.body.addEventListener("touchstart", function (e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
  }, false);
  document.body.addEventListener("touchend", function (e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
  }, false);
  document.body.addEventListener("touchmove", function (e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
  }, false);

let onPaint = () => {
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
};

function updatePrediction(prediction) {
    $('#result').children('p').text(prediction);
}

const chartCtx = document.getElementById('chart').getContext('2d');
chartCtx.height = 150;
chartCtx.width = 150;

const probabilityChart = new Chart(chartCtx, {
    type: 'bar',
    data: {
        labels: [...Array(10).keys()],
        datasets: [
            {
                backgroundColor: Array(10).fill("rgba(90, 230, 170, 0.4)"),
                data: Array(10).fill(0)
            }
        ]
    },
    options: {
        legend: {
            display: false
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            xAxes: [{
                gridLines: {
                    color: "rgba(0, 0, 0, 0)",
                },
                scaleLabel: {
                    labelString: 'Number',
                    display: true
                }
            }],
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    suggestedMax: 120
                },
                gridLines: {
                    color: "rgba(0, 0, 0, 0)"
                },
                scaleLabel: {
                    labelString: 'Probability (%)',
                    display: true
                }
            }]
        },
        animation: {
            onComplete() {
                const chartInstance = this.chart, ctx = chartInstance.ctx;
                ctx.font = Chart.helpers.fontString(
                    Chart.defaults.global.defaultFontSize, 
                    Chart.defaults.global.defaultFontStyle, 
                    Chart.defaults.global.defaultFontFamily);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';

                this.data.datasets.forEach((dataset, i) => {
                    const meta = chartInstance.controller.getDatasetMeta(i);
                    meta.data.forEach((bar, index) => {
                        const data = dataset.data[index];                            
                        ctx.fillText(data, bar._model.x, bar._model.y - 5);
                    });
                });
            }
        }
    }
});

function updateProbabilityGraph(chart, probabilities) {
    chart.data.datasets.forEach((dataset) => {
        dataset.data = [...probabilities];
    });
    chart.update();
}

function postResults() {
    $.ajax({
        url: './predict',
        type: 'POST',
        data: {img: canvas.toDataURL().replace('data:image/png;base64,','')},
        success(data) {
            payload = JSON.parse(data);
            updatePrediction(payload.prediction);
            probabilities = Object.values(payload.probabilities)
            updateProbabilityGraph(probabilityChart, probabilities);

        }
    });
}

function clearCanvas() {
    ctx.clearRect(0, 0, 280, 280);
    $('#result').children('p').text('0');
    updateProbabilityGraph(probabilityChart, Array(10).fill(0));
}

