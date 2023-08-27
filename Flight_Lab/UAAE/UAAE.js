let ATdata = [];
let Clestimates = [];
let colorIndex = 0;
const colors = [
    'rgba(255, 99, 132, 1)',  // Red
    'rgba(75, 192, 192, 1)',  // Cyan
    'rgba(255, 206, 86, 1)',  // Yellow
    'rgba(153, 102, 255, 1)', // Purple
    'rgba(255, 159, 64, 1)'   // Orange
];

document.getElementById('submit-button').addEventListener('click', function() {
    ATdata = [];
    var files = document.getElementById('input-files').files;
    
    if (files.length === 0) {
        alert('No file is selected');
        return;
    }

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var reader = new FileReader();
        
        reader.onload = function(e) {
            var contents = e.target.result;
            var lines = contents.split('\n');
            var reynoldsNumber = parseFloat(lines[3].split(',')[1]);  // assuming the Reynolds number is on the fourth line

            var data = {
                reynoldsNumber: reynoldsNumber,
                alpha: [],
                ClRaw: [],
                ClSlope: [],
                ClAccel: [],
                Cl: [],
                Cl_ClRaw: [],
                Cd: [],
                Cdp: [],
                Cm: [],
                Top_Xtr: [],
                Bot_Xtr: []
            };

            for (var j = 11; j < lines.length; j++) { // assuming the data starts from the 12th line
                var values = lines[j].split(',');
                if(values.length > 1) {
                    data.alpha.push(parseFloat(values[0]));
                    data.ClRaw.push(parseFloat(values[1]));
                    data.Cl_ClRaw.push(parseFloat(values[1]));
                    data.Cd.push(parseFloat(values[2]));
                    data.Cdp.push(parseFloat(values[3]));
                    data.Cm.push(parseFloat(values[4]));
                    data.Top_Xtr.push(parseFloat(values[5]));
                    data.Bot_Xtr.push(parseFloat(values[6]));    
                }
            }
            calculateCorrectedLift(data);
            ATdata.push(data);
            console.log(data);
            updateATDataChart();
        };
        
        reader.readAsText(file);
    }
    populateSpeedDropdowns();
});

document.getElementById('select-property').addEventListener('change', updateATDataChart);

function updateATDataChart() {
    var property = document.getElementById('select-property').value;
    var newDatasets
    var newDatasets2
    newDatasets = ATdata.map(function(dataset, index) {
        var color = colors[index % colors.length];
        if (dataset[property] != undefined){
            return {
                label: 'Reynolds Number: ' + dataset.reynoldsNumber,
                backgroundColor: color,
                borderColor: color,
                fill: false,
                lineTension: 0,
                pointRadius: 0,
                borderWidth: 2,
                data: dataset.alpha.map(function(alpha, index) {
                    return {
                        x: alpha,
                        y: dataset[property][index]
                    }
                })
            };
        } else {
            return {
                label: '',
            }
        }
    });
    newDatasets2 = ATdata.map(function(dataset, index) {
        var color = colors[index % colors.length + 1];
        if (property === 'Cl_ClRaw'){
            return {
                label: 'Reynolds Number: ' + dataset.reynoldsNumber,
                backgroundColor: color,
                borderColor: color,
                fill: false,
                lineTension: 0,
                pointRadius: 0,
                borderWidth: 2,
                data: dataset.alpha.map(function(alpha, index) {
                    return {
                        x: alpha,
                        y: dataset['Cl'][index]
                    }
                })
            };
        } else {
            return {
                label: '',
            }
        }
    });
    console.log(newDatasets);
    console.log(newDatasets2);
    let finalDatasets = [...newDatasets, ...newDatasets2];
    console.log(finalDatasets)
    if (window.myChart) {
        window.myChart.data.datasets = finalDatasets;
        window.myChart.update();
    } else {
        var ctx = document.getElementById('chart').getContext('2d');
        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: finalDatasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1,
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Alpha'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: property
                        }
                    }
                }
            }
        });
    } 
};

function calculateSpeed(reynoldsNumber, chordLength, temperature, pressure, wingSweep) {
    //console.log(reynoldsNumber);
    //console.log(chordLength);
    //console.log(temperature);
    //console.log(pressure);
    //console.log(wingSweep);
    // Constants
    const R = 287.058;  // specific gas constant for dry air [J/(kg·K)]
    const S = 110.4;  // Sutherland's constant for air [K]
    const refViscosity = 1.716e-5;  // reference viscosity at 273.15 K [Pa·s]

    // Calculate air density
    const density = pressure / (R * (temperature + 273.15));  // ideal gas law

    // Calculate dynamic viscosity using Sutherland's formula
    const viscosity = refViscosity * (((temperature + 273.15) / 273.15) ** 1.5) * ((273.15 + S) / (temperature + 273.15 + S));

    // Calculate speed parallel to chord
    const speedParallel = reynoldsNumber * viscosity / (chordLength * density);

    // Correct for wing sweep
    const speed = speedParallel / Math.cos(wingSweep * Math.PI / 180);

    // Convert speed to mph
    const speedMph = speed * 2.23694;

    return {
        speedMs: speed,
        speedMph: speedMph
    };
}

function populateSpeedDropdowns() {
    // Assuming you have the relevant input values for the conversion function
    const chordLength = parseFloat(document.getElementById('chord-length').value);
    const airTemp = parseFloat(document.getElementById('air-temperature').value);
    const airPressure = parseFloat(document.getElementById('air-pressure').value);
    const wingSweep = parseFloat(document.getElementById('wing-sweep').value);

    // Assuming you have two select elements with IDs 'speed-start' and 'speed-end'
    const startSelect = document.getElementById('speed-start');
    const endSelect = document.getElementById('speed-end');
    const incrementSelect = document.getElementById('speed-increment');
    const toleranceSelect = document.getElementById('speed-tolerance');

    // Clearing the select options
    startSelect.innerHTML = '';
    endSelect.innerHTML = '';
    incrementSelect.innerHTML = '';
    toleranceSelect.innerHTML = '';

    // Iterating from 100000 to 1500000 with a step of 100000
    for (let reynolds = 100000; reynolds <= 1500000; reynolds += 100000) {
        const speeds = calculateSpeed(reynolds, chordLength, airTemp, airPressure, wingSweep);

        const optionText = `Re: ${reynolds}\t${speeds.speedMs.toFixed(2)} m/s\t${speeds.speedMph.toFixed(2)} mph`;

        const startOption = document.createElement('option');
        startOption.text = optionText;
        startOption.value = reynolds;
        startSelect.add(startOption);

        const endOption = document.createElement('option');
        endOption.text = optionText;
        endOption.value = reynolds;
        endSelect.add(endOption);
    }
    // Iterating over the increment values
    const increments = [25000, 50000, 100000];
    for (let i = 0; i < increments.length; i++) {
        const speeds = calculateSpeed(increments[i], chordLength, airTemp, airPressure, wingSweep);

        const optionText = `Re: ${increments[i]}\t${speeds.speedMs.toFixed(2)} m/s\t${speeds.speedMph.toFixed(2)} mph`;

        const option = document.createElement('option');
        option.text = optionText;
        option.value = increments[i];
        incrementSelect.add(option);
    }
    // Iteration over the tolerance values
    const speedTolerances = [0.5,1.0,1.5,3.0,5.0];
    for (let i = 0; i < speedTolerances.length; i++) {
        const optionText = `${speedTolerances[i]} %`;

        const option = document.createElement('option');
        option.text = optionText;
        option.value = speedTolerances[i];
        toleranceSelect.add(option);
    }

    // Assuming you have three select elements with IDs 'alpha-start', 'alpha-end', and 'alpha-increment'
    const alphaStartSelect = document.getElementById('alpha-start');
    const alphaEndSelect = document.getElementById('alpha-end');
    const alphaIncrementSelect = document.getElementById('alpha-increment');
    const alphaToleranceSelect = document.getElementById('alpha-tolerance');
    // Clearing the select options
    alphaStartSelect.innerHTML = '';
    alphaEndSelect.innerHTML = '';
    alphaIncrementSelect.innerHTML = '';

    // Iterating from -10 to 15 with a step of 1
    for (let alpha = -10; alpha <= 15; alpha += 1) {
        const optionText = `Alpha: ${alpha}`;

        const startOption = document.createElement('option');
        startOption.text = optionText;
        startOption.value = alpha;
        alphaStartSelect.add(startOption);

        const endOption = document.createElement('option');
        endOption.text = optionText;
        endOption.value = alpha;
        alphaEndSelect.add(endOption);
    }

    // Iterating over the increment values
    const alphaIncrements = [0.1, 0.2, 0.5, 1.0];
    for (let i = 0; i < alphaIncrements.length; i++) {
        const optionText = `Alpha: ${alphaIncrements[i]}`;

        const option = document.createElement('option');
        option.text = optionText;
        option.value = alphaIncrements[i];
        alphaIncrementSelect.add(option);
    }

    // Iteration over the tolerance values
    const alphaTolerances = [0.5,1.0,1.5,3.0,5.0];
    for (let i = 0; i < alphaTolerances.length; i++) {
        const optionText = `${alphaTolerances[i]} %`;

        const option = document.createElement('option');
        option.text = optionText;
        option.value = alphaTolerances[i];
        alphaToleranceSelect.add(option);
    }
}

document.getElementById('speed-generate').addEventListener('click', function() {
    generateTiles('speed');
});

document.getElementById('alpha-generate').addEventListener('click', function() {
    generateTiles('alpha');
});

function generateTiles(type) {
    // Remove any existing tiles
    const tileContainer = document.getElementById('tile-container');
    Clestimates = [];

    while(tileContainer.firstChild) {
        tileContainer.removeChild(tileContainer.firstChild);
    }

    var colors = [
        'rgba(255, 0, 0, 0.5)',     // Red with 50% transparency
        'rgba(255, 165, 0, 0.5)',   // Orange with 50% transparency
        'rgba(255, 255, 0, 0.5)',   // Yellow with 50% transparency
        'rgba(0, 128, 0, 0.5)',     // Green with 50% transparency
        'rgba(255, 255, 0, 0.5)',   // Yellow with 50% transparency
        'rgba(255, 165, 0, 0.5)',   // Orange with 50% transparency
        'rgba(255, 0, 0, 0.5)'      // Red with 50% transparency
    ];

    var colors = [
        'rgba(0, 128, 0, 0.1)',     // Red with 50% transparency
        'rgba(0, 128, 0, 0.2)',   // Orange with 50% transparency
        'rgba(0, 128, 0, 0.3)',   // Yellow with 50% transparency
        'rgba(0, 128, 0, 0.4)',     // Green with 50% transparency
        'rgba(0, 128, 0, 0.3)',   // Yellow with 50% transparency
        'rgba(0, 128, 0, 0.2)',   // Orange with 50% transparency
        'rgba(0, 128, 0, 0.1)'      // Red with 50% transparency
    ];

    // Retrieve start, end, and increment values from dropdowns
    const start = parseFloat(document.getElementById(`${type}-start`).value);
    const end = parseFloat(document.getElementById(`${type}-end`).value);
    const increment = parseFloat(document.getElementById(`${type}-increment`).value);
    const tolerance = parseFloat(document.getElementById(`${type}-tolerance`).value);

    // Assuming you have the relevant input values for the conversion function
    const chordLength = parseFloat(document.getElementById('chord-length').value);
    const airTemp = parseFloat(document.getElementById('air-temperature').value);
    const airPressure = parseFloat(document.getElementById('air-pressure').value);
    const wingSweep = parseFloat(document.getElementById('wing-sweep').value);

    //generate tile tile
    let startTile = true
    while (startTile){
        var tile = document.createElement('div');
        tile.className = 'tile';  // Assign the CSS class to the tile

        // Create a new div for the descriptor
        var descriptorDiv = document.createElement('div');
        descriptorDiv.className = 'descriptor';
        
        // Create a new div for the title
        var titleDiv = document.createElement('div');
        titleDiv.className = 'tile-title';

        if (type === 'speed') {
            titleDiv.textContent = 'Reynolds #';
            descriptorDiv.appendChild(titleDiv);

        } else {
            titleDiv.textContent = `Alpha`;
            descriptorDiv.appendChild(titleDiv);
        }

        // Append the descriptor div to the tile
        tile.appendChild(descriptorDiv);

        // Create 7 additional divs and append them to the tile
        for (var i = 0; i < 7; i++) {
            var valueDiv = document.createElement('div');
            valueDiv.className = 'value-div';
            valueDiv.style.backgroundColor = colors[i]; // Apply the color
            valueDiv.textContent = ((i - 3)*tolerance).toFixed(2) + ' %';
            tile.appendChild(valueDiv);
        }

        // Append the tile div to the tile container
        tileContainer.appendChild(tile);
        startTile = false;
    }
    

    // Generate new tiles
    for (var value = start; value <= end; value += increment) {
        var valueArray;
        if (type === 'speed') {
            valueArray = speedToAlpha(value, tolerance);
        } else {
            valueArray = alphaToReynolds(value, tolerance);
        }
        

        var tile = document.createElement('div');
        tile.className = 'tile';  // Assign the CSS class to the tile

        // Create a new div for the descriptor
        var descriptorDiv = document.createElement('div');
        descriptorDiv.className = 'descriptor';
        
        // Create a new div for the title
        var titleDiv = document.createElement('div');
        titleDiv.className = 'tile-title';

        if (type === 'speed') {
            const speeds = calculateSpeed(value, chordLength, airTemp, airPressure, wingSweep);
            titleDiv.textContent = value + ' Re';
            descriptorDiv.appendChild(titleDiv);

            var speedDiv = document.createElement('div');
            speedDiv.className = 'tile-speed';
            speedDiv.textContent = speeds.speedMs.toFixed(2) + ' m/s ' + speeds.speedMph.toFixed(2) + ' mph';
            descriptorDiv.appendChild(speedDiv);
        } else {
            titleDiv.textContent = `${value.toFixed(2)} deg`;
            descriptorDiv.appendChild(titleDiv);
        }

        // Append the descriptor div to the tile
        tile.appendChild(descriptorDiv);

        // Create 7 additional divs and append them to the tile
        for (var i = 0; i < 7; i++) {
            var valueDiv = document.createElement('div');
            valueDiv.className = 'value-div';
            valueDiv.style.backgroundColor = colors[i]; // Apply the color
            console.log(valueArray[i]);
            valueDiv.textContent = valueArray[i];
            tile.appendChild(valueDiv);
        }

        // Append the tile div to the tile container
        tileContainer.appendChild(tile);
    }
}

function estimateClCurve(dataSets, desiredRe) {
    // Sort dataSets by Reynolds number
    dataSets.sort((a, b) => a.reynoldsNumber - b.reynoldsNumber);

    // If only one dataset, return its alpha and Cl arrays
    if (dataSets.length === 1) {
        return {reynoldsNumber: desiredRe, alpha: dataSets[0].alpha, Cl: dataSets[0].Cl};
    }
    
    // If desired Reynolds number is outside range, return closest dataset
    if (desiredRe < dataSets[0].reynoldsNumber) {
        return {reynoldsNumber: desiredRe, alpha: dataSets[0].alpha, Cl: dataSets[0].Cl};
    } else if (desiredRe > dataSets[dataSets.length - 1].reynoldsNumber) {
        return {reynoldsNumber: desiredRe, alpha: dataSets[dataSets.length - 1].alpha, Cl: dataSets[dataSets.length - 1].Cl};
    }

    // If desired Reynolds number exactly matches a dataset, return its alpha and Cl arrays
    for (let i = 0; i < dataSets.length; i++) {
        if (dataSets[i].reynoldsNumber === desiredRe) {
            return {reynoldsNumber: desiredRe, alpha: dataSets[i].alpha, Cl: dataSets[i].Cl};
        }
    }

    // Otherwise, find two closest datasets
    let lowerDataSet, upperDataSet;
    for (let i = 0; i < dataSets.length - 1; i++) {
        if (dataSets[i].reynoldsNumber <= desiredRe && dataSets[i + 1].reynoldsNumber >= desiredRe) {
            lowerDataSet = dataSets[i];
            upperDataSet = dataSets[i + 1];
            break;
        }
    }

    // Combine and sort alpha arrays
    let combinedAlpha = [...lowerDataSet.alpha, ...upperDataSet.alpha];
    combinedAlpha = [...new Set(combinedAlpha)].sort((a, b) => a - b);

    // Interpolate Cl values
    let interpolatedCl = combinedAlpha.map(alpha => {
        let lowerIndex = lowerDataSet.alpha.indexOf(alpha);
        let upperIndex = upperDataSet.alpha.indexOf(alpha);

        if (lowerIndex === -1 || upperIndex === -1) {
            return lowerIndex !== -1 ? lowerDataSet.Cl[lowerIndex] : upperDataSet.Cl[upperIndex];
        } else {
            let lowerCl = lowerDataSet.Cl[lowerIndex];
            let upperCl = upperDataSet.Cl[upperIndex];
            let fraction = (desiredRe - lowerDataSet.reynoldsNumber) / (upperDataSet.reynoldsNumber - lowerDataSet.reynoldsNumber);
            return lowerCl + fraction * (upperCl - lowerCl);  // Linear interpolation
        }
    });

    return {reynoldsNumber: desiredRe, alpha: combinedAlpha, Cl: interpolatedCl};
}

function speedToAlpha(desiredRe, tolerance) {
    // Call estimateClCurve to get the estimated Cl curve for the desired Reynolds number
    let clCurve = estimateClCurve(ATdata, desiredRe);
    console.log(clCurve);

    // Further processing...
    var liftValues = [];
    for (var i = -3; i <= 3; i++) {
        var liftPercentage = 100 + (i * tolerance);
        // Here, you would call a function that calculates the alpha value 
        // for the given Reynolds number and lift percentage.
        var alphaValue = calculateAlpha(clCurve, liftPercentage);
        //console.log(alphaValue)
        liftValues.push(alphaValue.toFixed(2));
    }
    return liftValues;
}

function calculateAlpha(clCurve, liftPercentage) {
    // Get alpha and Cl arrays from clCurve
    console.log(clCurve)
    let alpha = clCurve.alpha;
    let Cl = clCurve.Cl;

    // Get the aircraft weight, wing span, and chord length from user inputs
    let weight = parseFloat(document.getElementById('weight').value);
    let wingSpan = parseFloat(document.getElementById('wing-span').value);
    let chordLength = parseFloat(document.getElementById('chord-length').value);
    let wingSweep = parseFloat(document.getElementById('wing-sweep').value);

    // Get the air temperature and pressure from user inputs
    let airTempCelsius = parseFloat(document.getElementById('air-temperature').value);
    let airTemp = airTempCelsius + 273.15;  // convert from Celsius to Kelvin
    let airPressure = parseFloat(document.getElementById('air-pressure').value);

    // Calculate air density using the ideal gas law
    const R = 287.05; // Specific gas constant for air in J/(kg·K)
    let rho = airPressure / (R * airTemp);

    // Calculate wing area
    let wingArea = wingSpan * chordLength;

    // Calculate the lift (which is a percentage of the total weight)
    let lift = weight * (liftPercentage / 100);

    // Calculate the speed using the calculateSpeed function
    let speedData = calculateSpeed(clCurve.reynoldsNumber, chordLength, airTempCelsius, airPressure, wingSweep);
    let speed = speedData.speedMs*Math.cos(wingSweep * Math.PI / 180); // Speed in m/s

    // Calculate the target Cl value
    console.log(lift);
    console.log(rho);
    console.log(speed);
    console.log(wingArea);
    let targetCl = lift / (0.5 * rho * Math.pow(speed, 2) * wingArea);

    // Search for the alpha value corresponding to the target Cl value
    for (let i = 1; i < alpha.length; i++) {
        if (Cl[i] >= targetCl) {
            // Perform linear interpolation between the current alpha value and the previous alpha value
            let fraction = (targetCl - Cl[i-1]) / (Cl[i] - Cl[i-1]);
            let interpolatedAlpha = alpha[i-1] + fraction * (alpha[i] - alpha[i-1]);
            return interpolatedAlpha;
        }
    }

    // If no suitable alpha value is found, return null or some other default value
    return NaN;
}

function alphaToReynolds(desiredAlpha, tolerance) {
    // Further processing...
    var reynoldsValues = [];
    for (var i = -3; i <= 3; i++) {
        var liftPercentage = 100 + (i * tolerance);
        // Here, you would call a function that calculates the Reynolds number
        // for the given alpha and lift percentage.
        var reynoldsValue = calculateReynolds(desiredAlpha, liftPercentage);
        reynoldsValues.push(reynoldsValue);
        
    }
    return reynoldsValues;
}

function calculateReynolds(desiredAlpha, liftPercentage) {
    // Choose the initial guess for Reynolds number
    let bestRe, minCl = Infinity;
    for (let i = 0; i < ATdata.length; i++) {
        let data = ATdata[i];
        let clCurve = estimateClCurve(ATdata, data.reynoldsNumber);
        let targetCl;
        var index = clCurve.alpha.indexOf(desiredAlpha);
        if(index !== -1){
            targetCl = clCurve.Cl[index];
        }
        else{
            var lowerBoundIndex = clCurve.alpha.findIndex(a => a > desiredAlpha) - 1;
            var upperBoundIndex = lowerBoundIndex + 1;

            var alphaLower = clCurve.alpha[lowerBoundIndex];
            var alphaUpper = clCurve.alpha[upperBoundIndex];

            var clLower = clCurve.Cl[lowerBoundIndex];
            var clUpper = clCurve.Cl[upperBoundIndex];

            // Interpolate to find targetCl
            targetCl = clLower + ((clUpper - clLower) / (alphaUpper - alphaLower)) * (desiredAlpha - alphaLower);
        }
        if (targetCl >= 0 && targetCl < minCl) {
            minCl = targetCl;
            bestRe = data.reynoldsNumber;
        }
    }
    console.log(bestRe)
    if (minCl === Infinity) { // No positive Cl value found
        return NaN;
    }

    var reynoldsNumber = bestRe;  
    var newReynoldsNumber;
    var maxIterations = 10;
    var iteration = 0;
    
    do {
        let clCurve = estimateClCurve(ATdata, reynoldsNumber);
        var targetCl;
        var index = clCurve.alpha.indexOf(desiredAlpha);

        if(index !== -1){
            targetCl = clCurve.Cl[index];
        }
        else{
            var lowerBoundIndex = clCurve.alpha.findIndex(a => a > desiredAlpha) - 1;
            var upperBoundIndex = lowerBoundIndex + 1;

            var alphaLower = clCurve.alpha[lowerBoundIndex];
            var alphaUpper = clCurve.alpha[upperBoundIndex];

            var clLower = clCurve.Cl[lowerBoundIndex];
            var clUpper = clCurve.Cl[upperBoundIndex];

            // Interpolate to find targetCl
            targetCl = clLower + ((clUpper - clLower) / (alphaUpper - alphaLower)) * (desiredAlpha - alphaLower);
        }

        if(targetCl < 0) {
            return NaN;
        }
        
        const wingSweep = parseFloat(document.getElementById('wing-sweep').value);
        const weight = parseFloat(document.getElementById('weight').value);
        const lift = (liftPercentage / 100) * weight;
        const wingSpan = parseFloat(document.getElementById('wing-span').value);
        const chordLength = parseFloat(document.getElementById('chord-length').value);
        const wingArea = wingSpan * chordLength;
        const airTemp = parseFloat(document.getElementById('air-temperature').value) + 273.15;
        const airPressure = parseFloat(document.getElementById('air-pressure').value);
        const rho = airPressure / (287.05 * airTemp);
        const speed = Math.sqrt(2 * lift / (rho * targetCl * wingArea));
        newReynoldsNumber = rho * speed * chordLength / 1.81e-5;
        if (Math.abs(newReynoldsNumber - reynoldsNumber) < 1e-3) {
            calcSpeed = calculateSpeed(newReynoldsNumber, chordLength, airTemp - 273.15, airPressure, wingSweep)
            return Math.round(newReynoldsNumber/1000)*1000 + '\n' + calcSpeed.speedMs.toFixed(2) + ' m/s'  + '\n' + calcSpeed.speedMph.toFixed(2) + ' mph';
        }
        reynoldsNumber = newReynoldsNumber;
        iteration++;
        if (iteration >= maxIterations) {
            console.log('Warning: Maximum number of iterations reached in calculateReynolds()');
            calcSpeed = calculateSpeed(newReynoldsNumber, chordLength, airTemp - 273.15, airPressure, wingSweep)
            return Math.round(newReynoldsNumber/1000)*1000 + '\n' + calcSpeed.speedMs.toFixed(2) + ' m/s'  + '\n' + calcSpeed.speedMph.toFixed(2) + ' mph'; // Return the last calculated Reynolds number
        }
    } while (true);  
}

function calculateCorrectedLift(data) {
    let zeroLiftAlpha = findZeroLiftAlpha(data);
    let wingSpan = parseFloat(document.getElementById('wing-span').value);
    let chordLength = parseFloat(document.getElementById('chord-length').value);
    let aspectRatio = wingSpan / chordLength;
    aspectRatio = parseFloat(document.getElementById('AR').value)
    let CLa = calculateLiftCurveSlope(data);
    console.log(CLa*(Math.PI / 180));
    /* //The folowing may be correct but it is way too complicated and the values it currently return are not resonable
    for (let i = 0; i < data.alpha.length; i++) {
        let alpha = data.alpha[i] - zeroLiftAlpha;  // Adjust for the actual zero lift alpha
        alpha = alpha * Math.PI / 180;  // Convert to radians
        let CL_corrected = CLa * (2 * Math.PI * aspectRatio) / (2 + Math.sqrt(4 + Math.pow(aspectRatio/CLa, 2))) * alpha;
        data.Cl.push(CL_corrected);
    }
    */
    // Calculate and append corrected Cl values for each alpha
    for (let i = 0; i < data.alpha.length; i++) {
        let alpha = data.alpha[i] - zeroLiftAlpha;  // Adjust for the actual zero lift alpha
        alpha = alpha * Math.PI / 180;  // Convert to radians
        let CLa_2D = CLa;
        let CLa_3D = CLa_2D * (aspectRatio / (aspectRatio + 2));
        let CL_corrected = CLa_3D * (alpha);
        data.Cl.push(CL_corrected);
    }
}

function findZeroLiftAlpha(data) {
    // Find the indices between which zero lift occurs
    let index = 0;
    while (index < data.ClRaw.length && data.ClRaw[index] < 0) {
        index++;
    }

    // If no positive Cl found, return early
    if (index === 0 || index === data.ClRaw.length) {
        return null; // Or handle this situation as needed
    }

    // Perform linear interpolation between the two points
    let x1 = data.alpha[index-1];
    let y1 = data.ClRaw[index-1];
    let x2 = data.alpha[index];
    let y2 = data.ClRaw[index];

    let zeroLiftAlpha = x1 + (x2 - x1) * (-y1) / (y2 - y1);

    console.log(zeroLiftAlpha);
    return zeroLiftAlpha;
}

function calculateLiftCurveSlope(data) {
    let slopes = [];
    for (let i = 1; i < data.alpha.length; i++) {
        let dAlpha = data.alpha[i] - data.alpha[i-1];
        let dCl = data.ClRaw[i] - data.ClRaw[i-1];
        slopes.push(dCl / dAlpha)
        data.ClSlope.push(dCl / dAlpha);
    }

    for (let i = 1; i < data.alpha.length; i++) {
        let dAlpha = data.alpha[i] - data.alpha[i-1];
        let dCl = data.ClSlope[i] - data.ClSlope[i-1];
        data.ClAccel.push(dCl / dAlpha);
    }

    // Sort the slopes array and return the median
    slopes.sort((a, b) => a - b);
    let medianIndex = Math.floor(slopes.length / 2);
    let medianValue;

    if (slopes.length % 2) {
        // If there's an odd number of slopes, return the middle one
        medianValue = slopes[medianIndex]/(Math.PI/180);
    } else {
        // If there's an even number, return the average of the two middle ones
        medianValue = (slopes[medianIndex - 1] + slopes[medianIndex])/((Math.PI/180)*2);
    }

    // Initialize best score and index
    let bestScore = Infinity;
    let bestIndex;

    // Calculate scores based on acceleration
    for (let i = 5; i < data.ClAccel.length - 5; i++) {
        let score = 0;
        for (let j = i-5; j <= i+5; j++) {
            score += Math.abs(data.ClAccel[j]) + Math.abs(data.ClSlope[j] - medianValue);
        }
        if (score < bestScore) {
            bestScore = score;
            bestIndex = i;
        }
    }
    console.log(bestIndex)
    console.log(data.alpha[bestIndex])

    // Return the slope at the best index, converted to per radian
    return data.ClSlope[bestIndex] / (Math.PI / 180);
    
    
}

updateATDataChart();