// Get references to DOM elements
let canvas = document.getElementById('drawingCanvas');
let clearBtn = document.getElementById('clear-btn');
let generateBtn = document.getElementById('generate-btn');
let ctx = canvas.getContext('2d');
let myChart = null;

// Variables to hold mouse position data
let mouseX, mouseY, lastX, lastY;
let drawing = false;

let usedXValues = new Set();
// initialize points array:
let points = [];
let points2 = new Array(300)


// Event listeners

// grab the input box
let numHarmonicsInput = document.getElementById("numHarmonics");

// add an event listener for when the value changes
numHarmonicsInput.addEventListener("input", function() {
    if (numHarmonicsInput.value == 0) {
        numHarmonicsInput.style.borderColor = "red";
    } else {
        numHarmonicsInput.style.borderColor = ""; // reset to default
    }
});

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);

canvas.addEventListener('mouseleave', function() {
    drawing = false;
});

canvas.addEventListener('mouseenter', function(e) {
    if (e.buttons !== 1) return;
    drawing = true;
    draw(e);
});

document.getElementById('clear-btn').addEventListener('click', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    usedXValues.clear();
    points = new Array;
    points = [];
    document.getElementById('generate-btn').click();
    numHarmonicsInput.value = 0; // set the value of the input to 0
    numHarmonicsInput.style.borderColor = "red"; // also set the border color to red
});
generateBtn.addEventListener('click', mainChart);

document.getElementById('numHarmonics').addEventListener('change', mainChart)

// Handle mouse position and scaling
function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    let scaleX = canvas.width / rect.width;    // relationship bitmap vs. element for X
    let scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
    return {
        x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
        y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
}

// Function definitions
function startDrawing(e) {
    // Start drawing
    drawing = true;
    draw(e)
}

function draw(e) {
    // Update the last mouse position
    if (!drawing) return;
    let pos = getMousePos(canvas, e);
    pos.x = Math.round(pos.x);
    //console.log(pos.x + "  " + canvas.width);
    if (usedXValues.has(pos.x) || pos.x >= canvas.width) return;
    usedXValues.add(pos.x);
    points[pos.x] = pos;
    redraw(pos.x);
}

function redraw(posx) {

    //find nearby points
    var leftPoint
    var rightPoint
    for (let i = posx + 1; i < points.length || i < posx + 10; i++) {
        //console.log(points)
        if (points[i] !== undefined) {
            rightPoint = points[i]
            break
        }
    }
    for (let i = posx - 1; i > 0 || i > posx - 10; i--) {
        if (points[i] !== undefined) {
            leftPoint = points[i]
            break
        }
    }

    //drawing
    margin = 0;
    if (leftPoint !== undefined && rightPoint !== undefined){
        //console.log('case 1 is true');
        ctx.clearRect(leftPoint.x - margin, Math.min(leftPoint.y,rightPoint.y) - margin, rightPoint.x - leftPoint.x + 2*margin, Math.abs(rightPoint.y - leftPoint.y) + 2*margin);
        ctx.beginPath();
        ctx.moveTo(leftPoint.x,leftPoint.y);
        ctx.lineTo(points[posx].x,points[posx].y);
        ctx.lineTo(rightPoint.x,rightPoint.y);
        ctx.stroke();
    } else if (rightPoint == undefined){
        //console.log('case 2 is true')
        ctx.clearRect(leftPoint.x - margin, Math.min(leftPoint.y,points[posx].y) - margin, points[posx].x - leftPoint.x + 2*margin, Math.abs(points[posx].y - leftPoint.y) + 2*margin);
        ctx.beginPath();
        ctx.moveTo(leftPoint.x,leftPoint.y);
        ctx.lineTo(points[posx].x,points[posx].y);
        ctx.stroke();
    } else {
        //console.log('case 3 is true')
        ctx.clearRect(points[posx].x - margin, Math.min(points[posx].y,rightPoint.y) - margin, rightPoint.x - points[posx].x + 2*margin, Math.abs(rightPoint.y - points[posx].y) + 2*margin);
        ctx.beginPath();
        ctx.moveTo(points[posx].x,points[posx].y)
        ctx.lineTo(rightPoint.x,rightPoint.y);
        ctx.stroke();
    }
}

function stopDrawing() {
    if (!drawing) return;
    drawing = false;
    ctx.beginPath(); // reset the path
}

function fillInPoints(index) {
    //find nearby points
    var leftPoint //= canvas.height/2;
    var rightPoint //= canvas.height/2;
    var leftIndex = 0;
    var rightIndex = canvas.width;

    for (let i = index + 1; i < points.length; i++) {
        if (points[i] !== NaN && points[i] !== undefined) {
            rightPoint = points[i].y
            rightIndex = i
            break
        } else {
            rightPoint = 0;
        }
    }
    for (let i = index - 1; i > 0; i--) {
        if (points[i] !== NaN && points[i] !== undefined) {
            leftPoint = points[i].y;
            leftIndex = i;
            break
        } else {
            leftPoint = 0;
        }
    }
    if (leftPoint == undefined || leftPoint == NaN || leftPoint == 0){
        leftPoint = rightPoint;
        //leftIndex = rightIndex; 
    }
    if (rightPoint == undefined){
        rightPoint = leftPoint
        //rightIndex = leftIndex;
    }
    // Compute the slope of the line through leftPoint and rightPoint
    var slope = (rightPoint - leftPoint) / (rightIndex - leftIndex);

    // Compute the y-coordinate of the point at 'index'
    var y = leftPoint + slope * (index - leftIndex);
    points2[index] = {x: index,y: y};
    console.log(index + '   ' + y + '   ' + leftPoint + '   ' + rightPoint)
}

function calculateFourierCoefficients(n) {
    let N = points2.length;  // define N based on the number of points
    let a_n = 0;
    let b_n = 0;
    //console.log('n: ' + n);
    if (n == 0) {
        for (let t = 0; t < N; t++) {
            if (points2[t] !== undefined) {
                //console.log(points[t])
                a_n += ((Math.abs(points2[t].y - canvas.height) - canvas.height/2) * Math.cos(2 * Math.PI * n * t / N))/N;
                b_n += ((Math.abs(points2[t].y - canvas.height) - canvas.height/2) * Math.sin(2 * Math.PI * n * t / N))/N;
            }        
        }
    } else {
        for (let t = 0; t < N; t++) {
            if (points2[t] !== undefined) {
                //console.log(points[t])
                a_n += 2*((Math.abs(points2[t].y - canvas.height) - canvas.height/2) * Math.cos(2 * Math.PI * n * t / N))/N;
                b_n += 2*((Math.abs(points2[t].y - canvas.height) - canvas.height/2) * Math.sin(2 * Math.PI * n * t / N))/N;
            }        
        }
    }


    //a_n /= N;
    //b_n /= N;
    //console.log(N)
    //console.log(a_n)
    return {a: a_n, b: b_n};
}

function generateFourierSeries(numTerms, canvasWidth) {
    let N = points2.length;  // The number of data points
    let series = [];  // Array to store the points of the Fourier series
    let coeffs = [];  // Array to store the coefficients
    points2 = new Array(300)
    // fill in missing points
    //console.log(points);
    for (let i = 0; i < points2.length; i++) {
        if (points[i] == undefined){
            try {
                fillInPoints(i);
                console.log('found a missing point: ' + i + ' (no error)');
            } catch {
                console.log('error in fillInPoints for: ' + i)
            }
        } else {
            points2[i] = points[i];
        }
    }
    //console.log(points);
    console.log(points2);

    

    // Calculate the coefficients for each term
    for (let n = 0; n <= numTerms; n++) {
        coeffs.push(calculateFourierCoefficients(n));
    }
    console.log(coeffs)
    // Compute the Fourier series for each point in time
    for (let t = 0; t < canvasWidth; t++) {
        let y = 0;  // y-value of the Fourier series at time t

        // Add each term of the Fourier series
        for (let n = 0; n <= numTerms; n++) {
            //console.log(N)
            //console.log(coeffs[n])
            y += coeffs[n].a * Math.cos(2 * Math.PI * n * t / N) + coeffs[n].b * Math.sin(2 * Math.PI * n * t / N);
        }

        // Add the point to the Fourier series
        series.push({x: t, y: y});
    }
    //console.log('series: ');
    //console.log(series)
    return series;  // Return the Fourier series as an array of points

}

function mainChart() {
    xValues = [];
    yValues = [];
    xValues2 = [];
    
    let canvasWidth = canvas.width; // replace this with your canvas width
    let canvasHeight = canvas.height

    let numTerms = document.getElementById('numHarmonics').value;
    //console.log('numTerms: ' + numTerms);
    let fourierSeriesPoints = generateFourierSeries(numTerms, canvasWidth)
    //console.log(fourierSeriesPoints)



    for (let i = 0; i < canvas.width; i++) {
        //console.log(i)
        //console.log(fourierSeriesPoints[i])
        xValues2.push(fourierSeriesPoints[i].y)

        if (points2[i] !== undefined) {
            xValues.push(points2[i].x);
            yValues.push(Math.abs(points2[i].y - canvas.height) - canvas.height/2);
        }        
    }

    //console.log(xValues2)

    let chartData = [xValues,yValues]; // populate this array with your data
    //console.log(chartData)

    let ctx = document.getElementById('myChart').getContext('2d');
    if (myChart !== null) {
        //console.log('guess its not null')
        myChart.destroy();
    } else {
        //console.log('guess its null');
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData[0],
            datasets: [{
                label: 'Fourier Series',
                data: xValues2,
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
                borderColor: 'rgba(0, 123, 255, 1)',
                pointRadius: 0
            },
            {
               label: 'Drawn Points',
                data: chartData[1],
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
                borderColor: 'rgba(0, 0, 0, 1)',
                pointRadius: 0 
            }]
        },
        options: {
            animation: {
                duration: 0 // No animation
            },
            scales: {
                x: {
                    min: 0,
                    max: canvasWidth,
                    type: 'linear',
                    position: 'bottom'
                },
                y: {
                    min: -canvasHeight/2,
                    max: canvasHeight/2,
                    beginAtZero: true
                }
            },
        }
    });
}


document.getElementById('generate-btn').click();
document.getElementById('clear-btn').click();