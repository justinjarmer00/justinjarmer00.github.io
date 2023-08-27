//Global Variables
let coefficients = [];
let phases = [];
let maxValue = 0;
let B = 0;

// Initialize chart instances to null
let mainChart = null;
let coeffPlot = null;
let phasePlot = null;

// 1. Generate coefficients and phases
function generateCoefficientsAndPhases(N, R) {
    coefficients = [];
    phases = [];

    // Loop through each harmonic
    for (let i = 0; i < N; i++) {
        // Generate random coefficient (with decay) and phase
        let coeff = Math.random() * R**i;
        let phase = Math.random() * 2 * Math.PI;

        // Add coefficient and phase to their respective arrays
        coefficients.push(coeff);
        phases.push(phase);
    }

    return [coefficients, phases];
}

// 2. Generate Fourier Series
function generateFourierSeries(B, coefficients, phases) {
    // Determine the number of points to generate based on B
    let pointsPerPeriod = 1000;
    let totalPoints = pointsPerPeriod * B;
    let xValues = [];
    let yValues = [];
    maxValue = 0;
    
    // Generate xValues
    for (let i = 0; i < totalPoints; i++) {
        xValues.push(i / pointsPerPeriod);
    }
    
    // Generate yValues
    for (let x of xValues) {
        let y = 0;
        for (let n = 0; n < coefficients.length; n++) {
            y += coefficients[n] * Math.cos(2 * Math.PI * (n+1) * x + phases[n]);
        }
        yValues.push(y);
        // Update maxValue if absolute y is larger
        if (Math.abs(y) > maxValue) {
            maxValue = Math.abs(y);
        }
    }
    
    // Normalize yValues
    for (let i = 0; i < yValues.length; i++) {
        yValues[i] /= maxValue;
    }

    return [xValues, yValues, maxValue];
}

// 3. Generate single harmonic
function generateSingleHarmonic(coefficient, phase, harmonicNumber, B, maxValue) {
    // Determine the number of points to generate based on B
    let pointsPerPeriod = 1000;
    let totalPoints = pointsPerPeriod * B;
    let xValues = [];
    let yValues = [];
    
    // Generate xValues
    for (let i = 0; i < totalPoints; i++) {
        xValues.push(i / pointsPerPeriod);
    }
    
    // Generate yValues for the specific harmonic
    for (let x of xValues) {
        let y = coefficient[harmonicNumber] * Math.cos(2 * Math.PI * (harmonicNumber + 1) * x + phase[harmonicNumber]);
        yValues.push(y);
    }
    
    // Normalize yValues using the passed maxValue
    for (let i = 0; i < yValues.length; i++) {
        yValues[i] /= maxValue;
    }

    return [xValues, yValues];
}

// 4. Plotting function
function plotFunction(mainChartData, coefficients, phases) {
    // Main chart
    let mainChartCanvas = document.getElementById('mainChart').getContext('2d');
    
    // Check if chart instance already exists
    if (mainChart !== null) {
        // If yes, destroy the existing chart
        mainChart.destroy();
    }

    // Create a new chart instance
    mainChart = new Chart(mainChartCanvas, {
        type: 'line',
        data: {
            labels: mainChartData[0], // xValues
            datasets: [{
                label: 'Fourier Series / Harmonic',
                data: mainChartData[1], // yValues
                borderColor: 'rgba(75,192,192,1)',
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Fourier Series / Harmonic'
            },
            scales: {
                x: {
                    display: true,
                },
                y: {
                    display: true,
                    min: -1.02,
                    max: 1.02 
                }
            }
        }
    });

    // Coefficients and Phases scatter plots
    let coeffCanvas = document.getElementById('coeffPlot').getContext('2d');
    let phaseCanvas = document.getElementById('phasePlot').getContext('2d');

    // Similar check for coeffPlot
    if (coeffPlot !== null) {
        coeffPlot.destroy();
    }

    coeffPlot = new Chart(coeffCanvas, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Coefficients',
                data: coefficients.map((coeff, i) => ({x: i+1, y: coeff})),
                backgroundColor: 'rgba(75,192,192,1)',
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Fourier Series / Harmonic'
            },
            scales: {
                x: {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'x'
                    }
                },
                y: {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'y'
                    }
                }
            }
        }
    });

    // Similar check for phasePlot
    if (phasePlot !== null) {
        phasePlot.destroy();
    }

    phasePlot = new Chart(phaseCanvas, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Phases',
                data: phases.map((phase, i) => ({x: i+1, y: phase})),
                backgroundColor: 'rgba(75,192,192,1)',
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Fourier Series / Harmonic'
            },
            scales: {
                x: {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'x'
                    }
                },
                y: {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'y'
                    }
                }
            }
        }
    });

    
    // Adjust the size of the coefficients container to match the chart
    let coeffContainer = document.getElementById('coefficients-container');
    coeffContainer.style.height = coeffPlot.height + 'px';
    coeffContainer.style.width = coeffPlot.width + 'px';

    // Adjust the size of the phases container to match the chart
    let phaseContainer = document.getElementById('phases-container');
    phaseContainer.style.height = phasePlot.height + 'px';
    phaseContainer.style.width = phasePlot.width + 'px';
}

// Event Listener for 'Generate' Button
document.getElementById('generateButton').addEventListener('click', function() {
    // Reset the dropdown menu to 'full'
    document.getElementById('chart-select').value = 'full';

    // Retrieve user inputs
    const N = document.getElementById('numHarmonics').value;
    const R = 1/document.getElementById('decayRate').value;
    B = document.getElementById('baseFrequency').value;

    // Disable the button to prevent multiple submissions
    this.setAttribute('disabled', 'disabled');

    // Generate the coefficients and phases
    const [coefficients, phases] = generateCoefficientsAndPhases(N, R);

    // Generate the Fourier Series
    const [xValues, yValues, maxValueReturned] = generateFourierSeries(B, coefficients, phases);
    maxValue = maxValueReturned; // Assign it here

    // Plot the function
    let mainChartData = [xValues, yValues]
    plotFunction(mainChartData, coefficients, phases);

    // Update dropdown menu
    let dropdownMenu = document.getElementById('chart-select');
    
    // Clear existing options
    while (dropdownMenu.firstChild) {
        dropdownMenu.firstChild.remove();
    }

    // Add 'Full Fourier Series' option
    let fullOption = document.createElement('option');
    fullOption.value = 'full';
    fullOption.text = 'Full Fourier Series';
    dropdownMenu.appendChild(fullOption);
    
    // Add harmonic options
    for (let i = 0; i < N; i++) {
        let harmonicOption = document.createElement('option');
        harmonicOption.value = i;
        harmonicOption.text = `Harmonic ${i + 1}`;
        dropdownMenu.appendChild(harmonicOption);
    }

    // Enable the button again after the processing is done
    this.removeAttribute('disabled');
});

//Event listener for the drop down menu
let dropdownMenu = document.getElementById('chart-select');

dropdownMenu.addEventListener('change', function() {
    // Get the selected option
    let selectedOption = dropdownMenu.value;

    if (selectedOption === 'full') {
        // Redraw the main chart with the full Fourier series
        // This might involve calling `generateFourierSeries` function and updating the chart with the returned data
        const [xValues, yValues, maxValueReturned] = generateFourierSeries(B, coefficients, phases)
        maxValue = maxValueReturned;
        let mainChartData = [xValues, yValues]
        plotFunction(mainChartData, coefficients, phases);

    } else {
        // Generate the single harmonic
        let singleHarmonic = generateSingleHarmonic(coefficients, phases, selectedOption, B, maxValue);

        // Update the chart with the single harmonic
        plotFunction(singleHarmonic, coefficients, phases)
    }
});

// At the end of your JS file... runs the intial generation
document.getElementById('generateButton').click();
