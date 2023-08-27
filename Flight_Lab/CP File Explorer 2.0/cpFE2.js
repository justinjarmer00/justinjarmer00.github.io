// Data storage & manegement
let dataSets = [];
let startEnd = [[undefined,undefined],[undefined,undefined]];
let sensors = [[],[]];

class DataSet {
    constructor(name, wingSweep, airPressure, airTemperature, cordLength) {
      this.name = name;
      this.start;
      this.end;
      this.wingSweep = wingSweep;
      this.airPressure = airPressure;
      this.airTemperature = airTemperature;
      this.cordLength = cordLength;
      this.mainFile;
      this.coordFile;
      this.caliFile;
      this.topString;
      this.bottomString;
      this.ppString;
      this.coordsTopString;
      this.coordsBottomString
      this.rowCords;
      this.rowCali;
      this.sensors = [];
    }

    saveToFile() {
        let filename = this.name + '_cpfe2ds.json';
        const dataString = JSON.stringify(this, null, 2); // stringify with pretty print
        this.download(filename, dataString);
    }
    
    download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
}

class Sensor {
    constructor(title, array, time, index, xpos, calibration, conversion) {
        this.title = title;
        this.array = array;
        this.time = time;
        this.index = index;
        this.xpos = xpos;
        this.calibration = calibration;
        this.conversion = conversion;
        this.group;
    }

    name() {
        if (this.group) {
            return this.xpos ? `${this.title}\t${this.group}\t${this.xpos}` : `${this.index}\t${this.group}`;
        } else {
            return `${this.title}`;
        }
    }

    average(start,end) {
        this.conversion = this.conversion ? this.conversion : 1;
        let columnAvg = 0;
        let length = 0;
        if (start == undefined){
            start = 0;
        };
        if (end == undefined){
            end = this.array.length;
        };
        for (let i = start; i < Math.min(this.array.length, end); i ++){
            columnAvg += this.array[i] ? this.array[i]*this.conversion : 0; //conversion included
            length += this.array[i] ? 1: 0;                 
        }
        columnAvg = columnAvg/(length); 
        return columnAvg
    }

    errorbars(start,end) {
        try {
            this.conversion = this.conversion ? this.conversion : 1;
            let array = [];
            if (start == undefined){
                start = 0;
            };
            if (end == undefined){
                end = this.array.length;
            };
            for (let i = start; i < Math.min(this.array.length, end); i ++){
                this.array[i] && array.push(this.array[i]*this.conversion);                 
            }
            //console.log(array)
            let columnError = jStat.stdev(array);
            //console.log(columnError);
            let confidenceLevel = document.getElementById('confidence').value
            let alpha = 1 - confidenceLevel/100;
            let z = jStat.normal.inv(1 - alpha/2, 0, 1);
            //console.log(z);
            return z*columnError;
        } catch {
            console.log("error using jStat library");
            return 1;
        }
        
    }

    percentError(start, end) {
        try {
            this.conversion = this.conversion ? this.conversion : 1;
            let array = [];
            if (start == undefined){
                start = 0;
            };
            if (end == undefined){
                end = this.array.length;
            };
            for (let i = start; i < Math.min(this.array.length, end); i ++){
                this.array[i] && array.push(this.array[i]*this.conversion);                 
            }
            return jStat.stdev(array)/this.average(start,end);
        } catch {
            console.log("error using jStat library");
            return 0;
        }
    }

    data() {
        this.conversion = this.conversion ? this.conversion : 1;
        return this.array.map(value => value * this.conversion)
    }

    cali() {
        this.conversion = this.conversion ? this.conversion : 1;
        return this.calibration ? this.calibration*this.conversion : 0
    }
}

function getColumn(data, startRow, colIndex, single) {
    // Make sure startRow and colIndex are within the valid range
    if (startRow < 0 || startRow >= data.length || colIndex < 0 || colIndex >= data[startRow].length) {
        console.log("start row or column out of array index");
        console.log(`start row ${startRow}\t${data.length}\ncolumn ${colIndex}\n${data[startRow].length}`)
        return [];
    }
    // Use the slice method to start from the startRow, then use the map method to extract the colIndex
    return single ? [data[startRow][colIndex]] : data.slice(startRow).map(row => row[colIndex]);
}

function parseUserInput(input) {
    let ranges = input.split(',').map(range => {
        if (range.includes(':')) {
            return range.split(':').map(Number);
        } else {
            // if a single number, return it as both the start and end of a range
            return [Number(range), Number(range)];
        }
    });
    return ranges;
}

function assignGroupToSensors(dataSet, groupName, userInput) {
    let ranges = parseUserInput(userInput);
    let groupIndex = 0; // Add groupIndex to keep track of the sensor's position in the group

    for (let range of ranges) {
        for (let i = range[0]; i <= range[1]; i++) {
            let sensor = dataSet.sensors.find(sensor => sensor.title == i.toString());
            if (sensor) {
                sensor.group = groupName;
                sensor.index = groupIndex; // Assign groupIndex to the sensor
                groupIndex++; // Increment groupIndex
            }
        }
    }
}

function assignXposToSensors(dataSet, groupName, coordInput, coordsFileContents) {
    // Find sensors that belong to the specified group and sort them by their index
    let sensorsInGroup = dataSet.sensors
        .filter(sensor => sensor.group === groupName)
        .sort((a, b) => a.index - b.index);

    // Parse the coordinate range input
    let rowXpos = parseFloat(document.getElementById("coordinates-row").value);
    dataSet.rowCords = rowXpos;
    
    let coordRanges = parseUserInput(coordInput);
    let coords = [];

    // Iterate over the coordinate ranges and push the corresponding coordinates to the coords array
    for (let range of coordRanges) {
        for (let i = range[0]; i <= range[1]; i++) {
            coords.push(coordsFileContents[rowXpos][i - 1]);  // Subtract 1 because file content array is 0-indexed
        }
    }

    // Assign the coordinate to the corresponding sensor
    for (let i = 0; i < sensorsInGroup.length; i++) {
        sensorsInGroup[i].xpos = parseFloat(coords[i]);
    }
}

function autoProcessFiles(dataSet, mainFileContents, coordsFileContents, caliFileContents) {
    // Initialize sensor title and data start line
    let sensorTitleLine = null;
    let dataStartLine = null;

    // Function to check if a string can be converted to a number or is 'N/A'
    function isNumberOrNA(str) {
        return !isNaN(str) || str === 'N/A';
    }

    // Find the sensor title line and data start line
    for (let i = 0; i < mainFileContents.length; i++) {
        let allNumbersOrNA = mainFileContents[i].every(isNumberOrNA);
        if (allNumbersOrNA && sensorTitleLine === null) {
            sensorTitleLine = mainFileContents[i - 1];
            dataStartLine = i;
            break;
        }
    }

    // Ensure that sensor title line and data start line were found
    if (sensorTitleLine === null || dataStartLine === null) {
        console.error("Unable to determine sensor title line and/or data start line.");
        return;
    }

    // Parse sensors
    let rowCali = parseFloat(document.getElementById("cali-row").value);
    dataSet.rowCali = rowCali;
    for (let i = 0; i < sensorTitleLine.length; i++) {
        let sensorTitle = sensorTitleLine[i].trim();
        let sensorData = mainFileContents.slice(dataStartLine).map(line => line[i]);
        let time = "N/A";
        let calibration;
        if (parseFloat(sensorTitle)){
            calibration = caliFileContents ? parseFloat(caliFileContents[rowCali][sensorTitle - 1]) : 0;
        } else {
            console.log("title not a number");
        }
        let sensor = new Sensor(sensorTitle, sensorData, time, "N/A", "N/A", calibration);
        
        dataSet.sensors.push(sensor);
    }
    
    let userInputTop = document.getElementById("groupTOPRangeInput").value;
    let userInputBottom = document.getElementById("groupBOTTOMRangeInput").value;
    let userInputPP = document.getElementById("groupPPRangeInput").value;
    
    dataSet.topString = userInputTop;
    dataSet.bottomString = userInputBottom;
    dataSet.ppString = userInputPP;
    assignGroupToSensors(dataSet, "TOP", userInputTop);
    assignGroupToSensors(dataSet, "BOTTOM", userInputBottom);
    assignGroupToSensors(dataSet, "PITOT_RAW", userInputPP);

    let coordInputTop = document.getElementById("coordTOPRangeInput").value;
    let coordInputBottom = document.getElementById("coordBOTTOMRangeInput").value;
    dataSet.coordsTopString = coordInputTop;
    dataSet.coordsBottomString = coordInputBottom;
    assignXposToSensors(dataSet, "TOP", coordInputTop, coordsFileContents);
    assignXposToSensors(dataSet, "BOTTOM", coordInputBottom, coordsFileContents);

    // Handle pressure sensor group
    //let pressureSensors = sensorTitleLine.filter(title => !isNaN(title));
    //console.log(pressureSensors)
    // ...handle pressure sensors based on your app's specific requirements...
}

function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }
        
        let reader = new FileReader();

        reader.onload = function(e) {
            var contents = e.target.result; // Get the file contents
            var lines = contents.split('\n'); // Split the file into lines
            var array = lines.map(function(line) {
                return line.split('\t'); // Split each line into fields
            });
            resolve(array);
        };

        reader.onerror = reject;

        reader.readAsText(file);
    });
}

async function processFiles(mainFile, coordsFile, caliFile, dataSet) {
    try {
        let file1;
        let file2;
        let file3;
        if (!document.getElementById("main-data-file").disabled) {
            file1 = await readFileAsync(mainFile);
            file2 = await readFileAsync(coordsFile);
            file3 = await readFileAsync(caliFile);
            dataSet.mainFile = file1;
            dataSet.coordFile = file2;
            dataSet.caliFile = file3;
        } else {
            file1 = dataSet.mainFile;
            file2 = dataSet.coordFile;
            file3 = dataSet.caliFile;
        }
        autoProcessFiles(dataSet, file1, file2, file3)
        
        console.log(dataSet);
        dataSet.sensors.forEach((sensor) => {
            console.log(sensor.name());
        })
    } catch(err) {
        console.log(err);
    }
}

function createDataSet() {
    //Read Meta Data
    let name = document.getElementById("nickname").value;
    let wingSweep = parseFloat(document.getElementById("wing-sweep").value);
    let airPressure = parseFloat(document.getElementById("air-pressure").value);
    let airTemperature = parseFloat(document.getElementById("air-temperature").value);
    let cordLength = parseFloat(document.getElementById("cord-length").value);

    let dataSet = new DataSet(name, wingSweep, airPressure, airTemperature, cordLength);
    
    if (!document.getElementById("main-data-file").disabled) {
        let mainFile = document.getElementById("main-data-file").files[0];
        let coordsFile = document.getElementById("coordinates-file").files[0];
        let caliFile = document.getElementById("pressure-calibration-file").files[0] ? document.getElementById("pressure-calibration-file").files[0] : null;
        processFiles(mainFile, coordsFile, caliFile, dataSet);
    } else {
        const selectElement = document.getElementById('dataset-select');
        const selectedValue = selectElement.value;
        let dataSetOG = dataSets[selectedValue];
        file1 = dataSetOG.mainFile;
        file2 = dataSetOG.coordFile;
        file3 = dataSetOG.caliFile;
        dataSet.mainFile = file1;
        dataSet.coordFile = file2;
        dataSet.caliFile = file3;
        autoProcessFiles(dataSet, file1, file2, file3)
    }
    return dataSet;
}

function validateInputs() {
    let valid = true;
  
    const mainDataFile = document.getElementById('main-data-file');
    const coordinatesFile = document.getElementById('coordinates-file');
    const calibrationFile = document.getElementById('pressure-calibration-file');
    const allFiles = [mainDataFile, coordinatesFile, calibrationFile];
    
    const pastErrors = document.querySelectorAll('.error');
    pastErrors.forEach(error => error.remove());

    let nickname = document.getElementById("nickname");
    if (nickname.value === ''){
        nickname.style.borderColor = 'red';
        console.log('there was no nickname entered')
        return false;
    }
    for(let i = 0; i < dataSets.length; i++) {
        nickname.style.borderColor = '';
        if(dataSets[i].name === nickname.value && document.getElementById('dataset-select').value == 'new') {
            nickname.value = '';
        return false;
        }
    }

    const metaInputs = document.querySelectorAll(`.meta-inputs`);
    metaInputs.forEach(input => {
    input.style.borderColor = '';
    if (!input.value || input.value == '') {
        input.style.borderColor = 'red';
    }});

    allFiles.forEach(file => {
      if (!file.files[0]) {
        if (file.id === 'pressure-calibration-file') {
          // Calibration file is optional; do not invalidate the form if it is missing.
          return;
        }
        valid = false;
        const errorMessage = document.createElement('p');
        errorMessage.style.color = 'red';
        errorMessage.className = 'error';  
        errorMessage.textContent = 'This file is required.';
        file.parentElement.appendChild(errorMessage);
      } else if (file.files[0].type !== 'text/plain') {
        valid = false;
        const errorMessage = document.createElement('p');
        errorMessage.style.color = 'red';
        errorMessage.className = 'error';  
        errorMessage.textContent = 'Please upload a text file.';
        file.parentElement.appendChild(errorMessage);
      } else {
        const correspondingNumericInputs = document.querySelectorAll(`.${file.id}-inputs`);
        correspondingNumericInputs.forEach(input => {
        input.style.borderColor = '';
        if (!input.value || input.value == '') {
          input.style.borderColor = 'red';
          valid = false;
        }
      });
      }
    });
  
    return valid;
}

function updateDropdown(id) {
    let dropdown = document.getElementById(id);  // Get the dropdown element
    dropdown.innerHTML = '';  // Clear existing options
    if (id === 'dataset-select'){
        let defaultOption = document.createElement('option');
        defaultOption.value = 'new';
        defaultOption.text = 'New Dataset';
        dropdown.add(defaultOption);
    } else {
        let defaultOption = document.createElement('option');
        defaultOption.value = 'empty';
        defaultOption.text = 'select';
        dropdown.add(defaultOption);
    }
    dataSets.forEach((dataSet, index) => {
      let option = document.createElement('option');  // Create a new option element
      option.value = index;  // The value will be the index of the dataSet in the dataSets array
      option.text = dataSet.name;  // The text will be the nickname of the dataSet
      dropdown.add(option);  // Add the new option to the dropdown
    });
}

function updateSensorDropdown(id,index){
    let dropdown = document.getElementById(id);
    dropdown.innerHTML = '';

    //loop through sensors
    sensors[index - 1].forEach((sensor, pos) => {
        let option = document.createElement('option');  // Create a new option element
        option.value = pos;  // The value will be the index of the dataSet in the dataSets array
        option.text = sensor.name();  // The text will be the nickname of the dataSet
        dropdown.add(option);  // Add the new option to the dropdown
      });
}

function addDataSet(dataSet) {
    dataSets.push(dataSet);
    updateDropdown('dataset-select');
    updateDropdown('data-select-1');
    updateDropdown('data-select-2');
}
  
function removeDataSet(index) {
    dataSets.splice(index, 1);
    updateDropdown('dataset-select');
    updateDropdown('data-select-1');
    updateDropdown('data-select-2');
}

function loadDataSet(dataSet) {
    document.getElementById("coordinates-row").value = dataSet.rowCords
    
    document.getElementById("groupTOPRangeInput").value = dataSet.topString;
    document.getElementById("groupBOTTOMRangeInput").value = dataSet.bottomString;
    document.getElementById("groupPPRangeInput").value = dataSet.ppString ;

    document.getElementById("coordTOPRangeInput").value = dataSet.coordsTopString;
    document.getElementById("coordBOTTOMRangeInput").value = dataSet.coordsBottomString;

    document.getElementById("cali-row").value = dataSet.rowCali;

    document.getElementById("nickname").value = dataSet.name;
    document.getElementById("wing-sweep").value = dataSet.wingSweep;
    document.getElementById("air-pressure").value = dataSet.airPressure;
    document.getElementById("air-temperature").value = dataSet.airTemperature;
    document.getElementById("cord-length").value = dataSet.cordLength;

    document.getElementById("main-data-file").disabled = true;
    document.getElementById("coordinates-file").disabled = true;
    document.getElementById("pressure-calibration-file").disabled = true;

}

// Handlers
document.getElementById('next-button').addEventListener('click', handleNext);
document.getElementById('create-update-button').addEventListener('click', handleSubmit);
document.getElementById('discard-delete-button').addEventListener('click', handleDiscard);

document.getElementById('save-dataSet').addEventListener('click', handleSave);

document.getElementById('data-select-1').addEventListener('change', () => handleChange(1));
document.getElementById('data-select-2').addEventListener('change', () => handleChange(2));

document.getElementById('data-select-1-2').addEventListener('change', function() {
    displaySensors(1);
    sensorsHist(1);
});
document.getElementById('data-select-2-2').addEventListener('change', function() {
    displaySensors(2);
    sensorsHist(2);
});

document.getElementById('bins-mode-select-1').addEventListener('change', () => sensorsHist(1));
document.getElementById('bins-mode-select-2').addEventListener('change', () => sensorsHist(2));
document.getElementById('bins-input-1').addEventListener('change', () => sensorsHist(1));
document.getElementById('bins-input-2').addEventListener('change', () => sensorsHist(2));

document.getElementById('reset-button').addEventListener('click', initializeCharts)

//upload dataSet logic:
const fileInput = document.getElementById('load-dataSet');
fileInput.addEventListener('change', () => {
    const files = fileInput.files;
    if (!files.length) {
        console.log('No files selected!');
        return;
    }

    Array.from(files).forEach(file => {
        const reader = new FileReader();

        reader.onload = function(event) {
            const fileContent = event.target.result;
            let dataObject;
            try {
                dataObject = JSON.parse(fileContent);
            } catch (error) {
                console.error('Error parsing file:', error);
                return;
            }

            const dataSet = Object.assign(new DataSet(), dataObject);
            dataSet.sensors = []; // empty the sensors array
            loadDataSet(dataSet);
            let file1 = dataSet.mainFile;
            let file2 = dataSet.coordFile;
            let file3 = dataSet.caliFile;
            autoProcessFiles(dataSet, file1, file2, file3);
            addDataSet(dataSet);
            console.log('Data set loaded and sensors rebuilt successfully.');
            console.log(dataSet); // you can inspect the resulting dataSet in the console
        };

        reader.readAsText(file);
    });

    const dataInputSection = document.getElementById('data-form');
    dataInputSection.style.display = 'none';
});

function initializeCharts(){
    const allPlots = document.querySelectorAll(`.plot`);
    let x = [];
    let y = [];
    let data = {
        mode: 'line',
        x: x,
        y: y
    }
    var layout = {
        title: 'Empty Plots',
        xaxis: {
            //rangeselector: selectorOptions,
            rangeslider: {}
        },
        yaxis: {
            //fixedrange: true
        }
    };
    allPlots.forEach( plot => {
        Plotly.newPlot(plot, data, layout)
    })
    updateDropdown('data-select-1');
    updateDropdown('data-select-2');
}

function handleNext() {
    const selectElement = document.getElementById('dataset-select');
    const selectedValue = selectElement.value;

    if (selectedValue === 'new') {
        document.getElementById("main-data-file").disabled = false;
        document.getElementById("coordinates-file").disabled = false;
        document.getElementById("pressure-calibration-file").disabled = false;
        document.getElementById("save-dataSet").style.display = 'none';
        document.getElementById("custom-file-upload-div").style.display = 'inline';
        const dataInputSection = document.getElementById('data-form');
        const actionButton = document.getElementById('create-update-button');
        const discardButton = document.getElementById('discard-delete-button');
        document.getElementById('nickname').value = '';

        // Show the form
        dataInputSection.style.display = 'block';
        
        // Set the text for action and discard buttons
        actionButton.textContent = 'Create Dataset';
        discardButton.textContent = 'Discard';
    } else {
        const dataInputSection = document.getElementById('data-form');
        const actionButton = document.getElementById('create-update-button');
        const discardButton = document.getElementById('discard-delete-button');
        document.getElementById("save-dataSet").style.display = 'inline';
        document.getElementById("custom-file-upload-div").style.display = 'none';
        console.log(selectedValue)
        loadDataSet(dataSets[selectedValue])
        // Show the form
        dataInputSection.style.display = 'block';
        
        // Set the text for action and discard buttons
        actionButton.textContent = 'Update Dataset';
        discardButton.textContent = 'Delete';
    }
}

function handleDiscard() {
    const selectElement = document.getElementById('dataset-select');
    const selectedValue = selectElement.value;
    //enable files (if load data set disabled them)
    document.getElementById("main-data-file").disabled = false;
    document.getElementById("coordinates-file").disabled = false;
    document.getElementById("pressure-calibration-file").disabled = false;
    if (selectedValue === 'new'){
        const dataInputSection = document.getElementById('data-form');
        dataInputSection.style.display = 'none';
    } else {
        removeDataSet(selectedValue);
        const dataInputSection = document.getElementById('data-form');
        dataInputSection.style.display = 'none';
    }
}

function handleSubmit() {
    const selectElement = document.getElementById('dataset-select');
    const selectedValue = selectElement.value;
    if (selectedValue === 'new'){
        let valid = validateInputs();
        if (valid){
            let newDataSet = createDataSet();
            
            console.log(newDataSet);
            addDataSet(newDataSet);
            //loadFiles(newDataSet);
            const dataInputSection = document.getElementById('data-form');
            dataInputSection.style.display = 'none';
        } else {
            console.log('invalid sumbmission: could not create data set')
        }
    } else {
        let valid = validateInputs()
        if (valid){
            let updatedDataSet = createDataSet();
            removeDataSet(selectedValue);
            console.log(updatedDataSet);
            addDataSet(updatedDataSet);            

            const dataInputSection = document.getElementById('data-form');
            dataInputSection.style.display = 'none';
        } else {
            console.log('invalid submission: could not update data set')
        }
    }
}

function handleSave() {
    const selectElement = document.getElementById('dataset-select');
    const selectedValue = selectElement.value;
    let valid = validateInputs()
    if (valid){
        let updatedDataSet = createDataSet();
        removeDataSet(selectedValue);
        console.log(updatedDataSet);
        addDataSet(updatedDataSet);            
        updatedDataSet.saveToFile();
        const dataInputSection = document.getElementById('data-form');
        dataInputSection.style.display = 'none';
    } else {
        console.log('invalid submission: could not update data set')
    }
    
}

function handleChange(index){
    console.log('handleChange() was called')
    sensors[index - 1] = [];
    plotsRawPressure(index);
    plotsMainCP();
    plotsVandA(index);
    initializeRangeInput(index);
    createSensors(index);
    displaySensors(index);
    sensorsHist(index);    

    //activate range selector listeners
    try {
        //plots
        document.getElementById(`alpha-plot-${index}`).removeListener('plotly_relayout', (eventdata) => handleRelayoutAlpha(eventdata,index,'plot'));
        document.getElementById(`alpha-plot-${index}`).on('plotly_relayout', (eventdata) => handleRelayoutAlpha(eventdata,index,'plot'));
        //inputs
        document.getElementById(`left-${index}`).removeEventListener('change', (eventdata) => handleRelayoutAlpha(eventdata,index,'input'))
        document.getElementById(`right-${index}`).removeEventListener('change', (eventdata) => handleRelayoutAlpha(eventdata,index,'input'))
        document.getElementById(`left-${index}`).addEventListener('change', (eventdata) => handleRelayoutAlpha(eventdata,index,'input'))
        document.getElementById(`right-${index}`).addEventListener('change', (eventdata) => handleRelayoutAlpha(eventdata,index,'input'))
        //error CP
        document.getElementById('error-switch').removeEventListener('change', () => plotsMainCP());
        document.getElementById('error-switch').addEventListener('change', () => plotsMainCP());
        document.getElementById('confidence').removeEventListener('change', () => plotsMainCP());
        document.getElementById('confidence').addEventListener('change', () => plotsMainCP());
    } catch {
        //plots
        document.getElementById(`alpha-plot-${index}`).on('plotly_relayout', (eventdata) => handleRelayoutAlpha(eventdata,index,'plot'));
        //inputs
        document.getElementById(`left-${index}`).addEventListener('change', (eventdata) => handleRelayoutAlpha(eventdata,index,'input'))
        document.getElementById(`right-${index}`).addEventListener('change', (eventdata) => handleRelayoutAlpha(eventdata,index,'input'))
        //error CP
        document.getElementById('error-switch').addEventListener('change', () => plotsMainCP());
        document.getElementById('confidence').addEventListener('change', () => plotsMainCP());
    }

    //plotsRawPressure(index,startEnd) is called in the event listeners above  
}

function createSensors(index){
    let dataSet = dataSets[document.getElementById(`data-select-${index}`).value];
    dataSet.sensors.forEach((sensor) => {
        addSensor(index,sensor);
    });
}

function addSensor(index, sensor){
    sensors[index - 1].push(sensor);
    updateSensorDropdown(`data-select-${index}-2`,index);
}

function updateSensorDropdown(id,index){
    let dropdown = document.getElementById(id);
    dropdown.innerHTML = '';

    //loop through sensors
    sensors[index - 1].forEach((sensor, pos) => {
        let option = document.createElement('option');  // Create a new option element
        option.value = pos;  // The value will be the index of the dataSet in the dataSets array
        option.text = sensor.name();  // The text will be the nickname of the dataSet
        dropdown.add(option);  // Add the new option to the dropdown
      });
}

function plotsVandA(index){
    console.log('plotsVandA() was called')
    start = startEnd[index - 1][0];
    end = startEnd[index - 1][1];

    let dataSet = dataSets[document.getElementById(`data-select-${index}`).value];
    let alphaSensor = dataSet.sensors.find(object => object.title === "Alpha");
    let pitotSensor = dataSet.sensors.find(object => object.title === "Pitot(m/s)");
    let gpsSensor = dataSet.sensors.find(object => object.title === "GPS(m/s)");

    let alphaData = [prepDataSingle(alphaSensor, 'line', start, end)];
    let pitotData = prepDataSingle(pitotSensor, 'line', start, end);
    let gpsData = prepDataSingle(gpsSensor, 'line', start, end);
    let velocityData = [pitotData, gpsData];
    
    var alphaLayout = {
        title: 'Alpha',
        xaxis: {
            //rangeselector: selectorOptions,
            rangeslider: {}
        },
        yaxis: {
            //fixedrange: true
        }
    };
    var speedLayout = {
        title: 'Velocity',
        xaxis: {
            //rangeselector: selectorOptions,
            rangeslider: {}
        },
        yaxis: {
            //fixedrange: true
        }
    };
    
    Plotly.newPlot(`velocity-plot-${index}`, velocityData, speedLayout);
    Plotly.newPlot(`alpha-plot-${index}`, alphaData, alphaLayout);
}

function plotsRawPressure(index){
    start = startEnd[index - 1][0];
    end = startEnd[index - 1][1];
    console.log('plotsRawPressure() was called');
    let dataSet = dataSets[document.getElementById(`data-select-${index}`).value];
    //get range values
    let topArray = dataSet.sensors.filter(object => object.group === "TOP");
    topArray.sort((a, b) => a.index - b.index);

    let bottomArray = dataSet.sensors.filter(object => object.group === "BOTTOM");
    bottomArray.sort((a, b) => a.index - b.index);

    topPressureData =  prepRawDataArray(topArray, 'line', start, end);
    bottomPressureData = prepRawDataArray(bottomArray, 'line', start, end);
    
    pressureData = [topPressureData[0], bottomPressureData[0], topPressureData[1], bottomPressureData[1]]
    console.log(pressureData);
    var rawPressureTaps = {
        title: 'Raw pressure',
        xaxis: {
            //rangeselector: selectorOptions,
            //rangeslider: {}
        },
        yaxis: {
            autorange: 'reversed'
            //fixedrange: true
        }
    };

    //initialize layout
    var stDevTopLayout = {
        title: 'stdev of top pressure taps',
        xaxis: {
            //rangeselector: selectorOptions,
            //rangeslider: {}
        },
        yaxis: {
            //fixedrange: true
        }
    };

    var stDevBotLayout = {
        title: 'stdev of bottom pressure taps',
        xaxis: {
            //rangeselector: selectorOptions,
            //rangeslider: {}
        },
        yaxis: {
            //fixedrange: true
        }
    };

    Plotly.newPlot(`pressure-plot-${index}`, pressureData, rawPressureTaps);

    //make charts
    Plotly.newPlot(`stDevTop-plot-${index}`, [topPressureData[2]], stDevTopLayout);
    Plotly.newPlot(`stDevBot-plot-${index}`, [bottomPressureData[2]], stDevBotLayout);
}

function prepDataSingle(sensor, mode, start, end) {
    //account for missing information;
    if (start == undefined){
        start = 0;
    }
    if (end == undefined){
        end = sensor.array.length;
    };

    //initialize
    var x = [];

    for (i = start; i < sensor.array.length; i++){
        try {
            x.push(i);
        } catch {
            console.log('could not data to float for: ' + sensor.name());
        }
    }
    return {
        mode: mode,
        x: x,
        y: sensor.data(),
        name: sensor.name()
    };
}

function prepRawDataArray(sensorArray, mode, start, end) {
    //this data is like the pressure taps over the top (multiple columns)
    //this means that we will plot against somthing else than index
    
    let x = [];
    let y = [];
    let yError = [];
    let ycali = [];
    let sensorError = [];
    let sensorIndex = [];

    sensorArray.forEach((sensor, index) => {
        y.push(sensor.average(start,end))
        x.push(sensor.xpos)
        yError.push(sensor.errorbars(start,end))
        ycali.push(sensor.cali())
        sensorError.push(sensor.percentError())
        sensorIndex.push(index)
    })

    var vis;
    if (document.getElementById('error-switch').checked){
        vis = true;
    } else {
        vis = false;
    }

    return [{
        mode: mode,
        x: x,
        y: y,
        name: sensorArray[0].group,
        error_y: {
            type: 'data',
            array: yError,
            visible: vis
        }
    },
    {
        mode: mode,
        x: x,
        y: ycali,
        name: sensorArray[0].group + " Calibration"
    },{
        mode: mode,
        x: x,
        y: sensorError,
        name: sensorArray[0].group + " % Error"
    }];
}

function prepCP(pitotSensor, sensorArray, mode, name, start, end) {
    let x = [];
    let y = [];
    let yError = [];
    console.log(pitotSensor.average(start,end))
    sensorArray.forEach((sensor) => {
        console.log(sensor.average(start,end))
        console.log(sensor.cali())
        y.push((sensor.average(start,end) - sensor.cali())/pitotSensor.average(start,end))
        x.push(sensor.xpos)
        yError.push(sensor.errorbars(start,end)/pitotSensor.average(start,end))
    })

    var vis;
    if (document.getElementById('error-switch').checked){
        vis = true;
    } else {
        vis = false;
    }
    console.log(vis);

    return {
        mode: mode,
        x: x,
        y: y,
        name: name,
        error_y: {
            type: 'data',
            array: yError,
            visible: vis
        }
    }
}

function plotsMainCP(){
    console.log('plotsMainCP() was called');
    var topPressureData1 = {};
    var bottomPressureData1 = {};
    let mode = 'line';

    if (document.getElementById(`data-select-1`).value != 'empty'){
        let dataSet1 = dataSets[document.getElementById(`data-select-1`).value];
        let topArray = dataSet1.sensors.filter(object => object.group === "TOP");
        topArray.sort((a, b) => a.index - b.index);

        let bottomArray = dataSet1.sensors.filter(object => object.group === "BOTTOM");
        bottomArray.sort((a, b) => a.index - b.index);

        let pitotRaw = dataSet1.sensors.find(object => object.group === "PITOT_RAW");
        var reynolds1 = calcReynolds(dataSet1, startEnd[0][0], startEnd[0][1]);
        var nameEnd1 = " Reynolds Number: " + reynolds1;

        topPressureData1 = prepCP(pitotRaw, topArray, mode, dataSet1.name + ": Top Surface" + nameEnd1, startEnd[0][0],startEnd[0][1]);
        bottomPressureData1 = prepCP(pitotRaw, bottomArray, mode, dataSet1.name + ": Bottom Surface" + nameEnd1, startEnd[0][0],startEnd[0][1]);

        console.log('completed data1 calculations')
    }

    var topPressureData2 = {};
    var bottomPressureData2 = {};

    if (document.getElementById(`data-select-2`).value != 'empty'){
        let dataSet2 = dataSets[document.getElementById(`data-select-2`).value];
        let topArray = dataSet2.sensors.filter(object => object.group === "TOP");
        topArray.sort((a, b) => a.index - b.index);

        let bottomArray = dataSet2.sensors.filter(object => object.group === "BOTTOM");
        bottomArray.sort((a, b) => a.index - b.index);

        let pitotRaw = dataSet2.sensors.find(object => object.group === "PITOT_RAW");
        var reynolds2 = calcReynolds(dataSet2, startEnd[1][0], startEnd[1][1]);
        var nameEnd2 = " Reynolds Number: " + reynolds2;

        topPressureData2 = prepCP(pitotRaw, topArray, mode, dataSet2.name + ": Top Surface" + nameEnd2, startEnd[1][0],startEnd[1][1]);
        bottomPressureData2 = prepCP(pitotRaw, bottomArray, mode, dataSet2.name + ": Bottom Surface" + nameEnd2, startEnd[1][0],startEnd[1][1]);

        console.log('completed data1 calculations')
    }

    var pressureData = [topPressureData1, bottomPressureData1, topPressureData2, bottomPressureData2]
    console.log(pressureData);

    var mainCPlayout = {
        title: 'CP',
        xaxis: {
            //rangeselector: selectorOptions,
            //rangeslider: {}
        },
        yaxis: {
            autorange: 'reversed'
            //fixedrange: true
        },
        legend: {
            x: 0.5, 
            y: 0, // Play with this value
            xanchor: 'center',
            yanchor: 'bottom',
            traceorder: 'normal',
            font: {
                family: 'sans-serif',
                size: 12,
                color: '#000'
            },
            bgcolor: '#E2E2E2',
            bordercolor: '#FFFFFF',
            borderwidth: 2
        },
        margin: {
          t: 50, // top margin
          l: 50, // left margin
          r: 50, // right margin
          b: 100, // bottom margin, you may need to increase it
        }
    };

    Plotly.newPlot(`cp-plot`, pressureData, mainCPlayout);
}

function displaySensors(index) {
    let sensor = sensors[index - 1][document.getElementById(`data-select-${index}-2`).value];

    let sensorData = {
        mode: 'line',
        y: sensor.data(), 
        name: "Sensor Reading"
    }

    let sensorCali = {
        mode: 'line',
        y: sensor.data().map(value => sensor.cali()),
        name: "Sensor Calibration"
    }

    

    let sensorLayout = {
        title: sensor.name(),
        xaxis: {
            //rangeselector: selectorOptions,
            //rangeslider: {}
        },
        yaxis: {
            //fixedrange: true
        }
    };

    Plotly.newPlot(`tSeries-plot-${index}`, [sensorData,sensorCali], sensorLayout);
}

function sensorsHist(index) {
    let sensor = sensors[index - 1][document.getElementById(`data-select-${index}-2`).value];

    let binsMode = document.getElementById(`bins-mode-select-${index}`);
    let numberBins = document.getElementById(`bins-input-${index}`);

    let histData;

    if (binsMode.value === "true") {
        histData = {
            x: sensor.data(),
            type: 'histogram',
            autobinx: true
        }
    } else {
        histData = {
            x: sensor.data(),
            type: 'histogram',
            xbins: {
                start: Math.min(...sensor.data),
                end: Math.max(...sensor.data),
                size: (Math.max(...sensor.data) - Math.min(...sensor.data)) / parseFloat(numberBins.value)
            }
        }
    }

    let histLayout = {
        title: sensor.name(),
        xaxis: {title: 'value'},
        yaxis: {title: 'frequency'}
    }

    Plotly.newPlot(`hist-plot-${index}`, [histData], histLayout);
}

//Plot listeners
function handleRelayoutAlpha(eventdata,index, type) {
    //console.log(eventdata['xaxis.range'][0]);
    if (type == 'plot'){
        Plotly.relayout(document.getElementById(`velocity-plot-${index}`), {'xaxis.range': [eventdata['xaxis.range'][0], eventdata['xaxis.range'][1]]});
        
        try {
            console.log(eventdata['xaxis.range'][0])
            console.log(eventdata['xaxis.range'][1])
            startEnd[index - 1] = [Math.floor(eventdata['xaxis.range'][0]),Math.ceil(eventdata['xaxis.range'][1])];
        } catch {
            startEnd[index - 1] = [undefined,undefined];
            console.log('could not read rangeselector')
        }
        console.log(startEnd)
        document.getElementById(`leftDis-${index}`).value = Math.floor(eventdata['xaxis.range'][0]);
        document.getElementById(`rightDis-${index}`).value = Math.ceil(eventdata['xaxis.range'][1]);
        plotsRawPressure(index);
        plotsMainCP();
        createSensors(index,startEnd);
    }
    if (type == 'input') {
        console.log('i did get here');
        let left = document.getElementById(`left-${index}`).value;
        let right = document.getElementById(`right-${index}`).value;
        console.log(left);
        console.log(right);
        Plotly.relayout(document.getElementById(`alpha-plot-${index}`), {'xaxis.range': [left, right]});
        document.getElementById(`leftDis-${index}`).value = left;
        document.getElementById(`rightDis-${index}`).value = right;
    }

}

function calcReynolds(dataSet, start, end) {
    console.log("calcReynolds() was called");

    let lengthScale = parseFloat(dataSet.cordLength);
    let airPressure = parseFloat(dataSet.airPressure);
    let airTemperature = parseFloat(dataSet.airTemperature);
    let airDensity = calculateAirDensity(airPressure, airTemperature);
    
    let pitotRaw = dataSet.sensors.find(object => object.group === "PITOT_RAW");

    let pitot = pitotRaw.average(start,end) - pitotRaw.cali();
    let wingSweep = parseFloat(dataSet.wingSweep);

    var velocityAvg = Math.sqrt((2 * (pitot) * (249.09 / 1000)) / airDensity)*cosDegrees(wingSweep); // extra coefficients are to get in the right units

    // Calculate viscosity using the power-law approximation
    var T = airTemperature + 273.15;
    var A = 1.458e-6;
    var S = 110.4;
    var viscosity = A * Math.pow(T, 1.5) / (T + S);

    var ReynoldsNumber = (airDensity * velocityAvg * lengthScale) / viscosity;
    return ReynoldsNumber
}

function cosDegrees(degrees) {
    let radians = degrees * (Math.PI / 180);
    return Math.cos(radians);
}

function calculateAirDensity(pressure, temperature) {
    const molarMass = 0.02897; // kg/mol
    const gasConstant = 8.314; // J/(mol�K)
    const temperatureInKelvin = temperature + 273.15; // Convert temperature to Kelvin

    const density = (pressure * molarMass) / (gasConstant * temperatureInKelvin);
    return density;
}

function initializeRangeInput(index){
    let dataSet = dataSets[document.getElementById(`data-select-${index}`).value]; 
    document.getElementById(`left-${index}`).value = 0;
    document.getElementById(`right-${index}`).value = dataSet.sensors[0].array.length;
    document.getElementById(`left-${index}`).min= 0;
    document.getElementById(`right-${index}`).max = dataSet.sensors[0].array.length;
}