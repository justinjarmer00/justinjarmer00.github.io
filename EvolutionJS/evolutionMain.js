
const form = document.getElementById('form');

var wateringHoleEmpty;
var foodAvailable = 0;
var foodEaten;

var speciesNumber = 0;
var plantSpeciesList = [];
var plantTraits = [];
var meatSpeciesList = [];
var meatTraits = [];
var deadSpeciesList = [];
var allSpecies = [];
var traitRnd = [];

let countDown = document.getElementById('countDown');
let climateFinished = false; runFinished = true;
const chartContainer = document.getElementsByClassName('chartContainer');
chartContainer.width = '50%';

let pTOm, b1, b2, b3, b4, b5, numRandnum;
let dataChart;
let backgroundColorList = ['rgba(192,57,43,0.8)','rgba(39,174,96,0.8)','rgba(41,128,185,0.8)','rgba(230,126,34,0.8)','rgba(231,76,60,0.8)','rgba(52,152,119,0.8)','rgba(46,204,113,0.8)','rgba(211,84,0,0.8)','rgba(155,889,182,0.8)','rgba(16,188,156,0.8)','rgba(241,196,15,0.8)','rgba(142,68,173,0.8)','rgba(22,160,13,0.8)','rgba(243,156,18,0.8)']
// Game Parameters
var maxpopulation = 6;
var wateringHoleSize = 0
//var wateringHoleSize = 10; //average size

let cValueMod, bValueMod;

class DATA{
    constructor(){
        this.label;
        this.labels;
        this.data;
        this.yAxisID = 'y1';
        this.color;
    }
}
let avgLifeByTrait = new DATA();
let avgFoodByTrait = new DATA();
let avgPopByTrait = new DATA();
let byTraitList = [avgLifeByTrait,avgFoodByTrait,avgPopByTrait];

let initFoodByRnd = new DATA();
let remFoodByRnd = new DATA();
let sumPopByRnd = new DATA();
let numDieByRnd = new DATA();
let numSurviveByRnd = new DATA();
let climateByRnd = new DATA();
let lineList = [initFoodByRnd,remFoodByRnd,sumPopByRnd,numDieByRnd, numSurviveByRnd,climateByRnd];

class dataCollection{
    constructor () {
        this.rounds = [];
        this.initFood = [];
        this.remainingFood = [];
        this.foodEaten = [];
        this.numSpeciesDie = [];
        this.numSpeciesSurvive = [];
        this.loss = [];
        this.error = [];
        this.sumPop = [];
    }
    get numRounds() {
        return this.rounds.length;
    }
    get byRnd() {
        //initFood
        initFoodByRnd.label = 'Initial Food By Rnd (left)';
        initFoodByRnd.labels = this.rounds;
        initFoodByRnd.data = this.initFood;

        //remFood
        remFoodByRnd.label = 'Remaining Food By Rnd (left)';
        remFoodByRnd.labels = this.rounds;
        remFoodByRnd.data = this.remainingFood;

        sumPopByRnd.label = 'Sum of populations for all living species (left)'
        sumPopByRnd.labels = this.rounds;
        sumPopByRnd.data = this.sumPop;

        numDieByRnd.label = 'Number of Species that Die By Rnd (left)'
        numDieByRnd.labels = this.rounds;
        numDieByRnd.data = this.numSpeciesDie;

        numSurviveByRnd.label = 'Number of Species that Survive (left)'
        numSurviveByRnd.labels = this.rounds;
        numSurviveByRnd.data = this.numSpeciesSurvive;

        


    }
    get TotalbyTrait() {
        
        let list = [];
        allTraits.forEach((trait) => {
            let item = [];
            let count1 = 0;
            let count2 = 0;
            let count3 = 0;
            let withTrait = allSpecies.filter(species => species.T1.traitName == trait.traitName || species.T2.traitName == trait.traitName || species.T3.traitName == trait.traitName || species.T4.traitName == trait.traitName);
            withTrait.forEach((species) => {
                count1 ++;
                count2 += species.roundsPlayed;
                count3 += species.foodTotal;
            });
            item.push(trait.traitName, count1, count2, count3, '#species, #rnds, #food');
            list.push(item);
        })
        return list
    }
    get RelativebyTrait() {
        
        let list = [];
        let item1 = [];
        let item2 = [];
        let item3 = [];
        allTraits.forEach((trait) => {
            
            let count1 = 0;
            let count2 = 0;
            let count3 = 0;
            let withTrait = allSpecies.filter(species => species.T1.traitName == trait.traitName || species.T2.traitName == trait.traitName || species.T3.traitName == trait.traitName || species.T4.traitName == trait.traitName);
            withTrait.forEach((species) => {
                count1 ++;
                count2 += species.roundsPlayed;
                count3 += species.foodTotal;
            });
            if(count1 > 0){
                item1.push(trait.traitName);
                item2.push(Math.floor((count2/count1)*100)/100);
                item3.push(Math.floor((count3/count1)*100)/100);
            } else {
                item1.push(trait.traitName);
                item2.push(0);
                item3.push(0);
            }
            
            
        })
        //let avgLifeByTrait = new DATA();
        avgLifeByTrait.label = 'Average #of Rnds Survived by Trait';
        avgLifeByTrait.labels = item1;
        avgLifeByTrait.data = item2;

        avgFoodByTrait.label = 'Average #of Food Eaten by Trait';
        avgFoodByTrait.labels = item1;
        avgFoodByTrait.data = item3;
    }
}
//const theWatcher = new dataCollection
var theWatcher


function climate(){
    climateOn = document.getElementsByName('climateOn')[0].checked;
    if (climateOn){
        // generating coefficients
        let randomCoeff = [];
        let coeffSum = 0
        let numFunctions = document.getElementById('numFunctions').value;
        let decayRate = document.getElementById('decayRate').value;
        let ampMod = document.getElementById('ampMod').value;
        for (let i = 0; i < numFunctions; i++){
            let coeff = Math.random()*(decayRate**(-i));
            randomCoeff.push(coeff);
            coeffSum += coeff;
        }
        for (let i = 0; i < numFunctions; i++){
            randomCoeff[i] = ampMod*randomCoeff[i]/coeffSum; // to normalize
        }
        console.log(randomCoeff);

        let randomPhase = [];

        for (let i = 0; i < numFunctions; i++){
            let phase = Math.random()*(2*3.1415);
            randomPhase.push(phase);
        };
        console.log(randomPhase);

        //get list of rounds
        let numberRounds = document.getElementById('nRnds').value;
        let rounds = [];
        for (let i = 0; i < numberRounds; i++){
            let item = i + 1;
            rounds.push(item);
        };
        console.log(rounds);

        //generating points
        let data = [];
        climateFinished = false;
        let i = 0
        let maxNumberRounds = document.getElementById('rndsBFRep').value;
        let climatePause = setInterval(climateDataLoop,1);
        function climateDataLoop(){
            let value = 0;
            for (j = 0; j < numFunctions; j++){
                value += randomCoeff[j]*Math.cos(((2*3.1415)/maxNumberRounds)*(j+1)*(i+1) + randomPhase[j]);
                //console.log([i,j]);
            }
            data.push(value);
            i++;
            countDown.innerText = 'Progress: Generating Climate: ' + (numberRounds - i).toFixed() + ' Rnds remainning';
            if (i >= numberRounds){
                console.log('got here')
                countDown.innerText = 'Progress: Done';
                climateByRnd.label = 'Climate By Rnd (right)';
                climateByRnd.labels = rounds;
                climateByRnd.data = data;
                climateByRnd.yAxisID = 'y2'; 
                climateFinished = true;
                clearInterval(climatePause);
                
            }
        }
        runFinished = false;
    } else {
        climateFinished = true;
    }
}

function validateInputs(){
    b1E = document.getElementById('pBody1');
    b2E = document.getElementById('pBody2');
    b3E = document.getElementById('pBody3');
    b4E = document.getElementById('pBody4');
    b5E = document.getElementById('pBody5');
    b6E = document.getElementById('pBody6');
    pTOmE = document.getElementById('pTOm');
    pTOm2E = document.getElementById('pTOm2');
    
    if (parseFloat(b1E.value) + parseFloat(b2E.value) > 1){
        b2E.value = 1-b1E.value;
        b3E.value = 0;
        b4E.value = 0;
        b5E.value = 0;
    } else if (parseFloat(b1E.value) + parseFloat(b2E.value) + parseFloat(b3E.value) > 1){
        b3E.value = 1 - b1E.value - b2E.value;
        b4E.value = 0;
        b5E.value = 0;
    } else if (parseFloat(b1E.value) + parseFloat(b2E.value) + parseFloat(b3E.value) + parseFloat(b4E.value) > 1){
        b4E.value = 1 - b1E.value - b2E.value - b3E.value;
        b5E.value = 0;
    } else if (parseFloat(b1E.value) + parseFloat(b2E.value) + parseFloat(b3E.value) + parseFloat(b4E.value) + parseFloat(b5E.value) > 1){
        b5E.value = 1 - b1E.value - b2E.value - b3E.value - b4E.value;
    }
    b6E.value = 1 - b1E.value - b2E.value - b3E.value - b4E.value - b5E.value;
    pTOm2E.value = 1 - pTOmE.value;

    numRandnum = document.getElementById('numRandnum');
    let stanErrorWater = document.getElementById('stanErrorWater');
    stanErrorWater.value = (((3)**(0.5))/6)/((numRandnum.value)**(0.5))*wateringHoleSize;
    //console.log('this right here! ' +stanErrorWater.value)

    document.getElementById('rEnd').value = document.getElementById('nRnds').value;


}

const genClimate = document.getElementById('genClimate');
genClimate.addEventListener("click", function(){
    if (runFinished){
        climate();
    }
    
});

form.addEventListener('submit', e => {
    e.preventDefault();
    console.clear();
    let nRnds = parseFloat(document.getElementById('nRnds').value.trim());
    wateringHoleSize = parseFloat(document.getElementById('wateringHoleSize').value.trim());
    let numberSpeciesInit = parseFloat(document.getElementById('initialNSpecies').value.trim());
    let numberSpeciesAdd = parseFloat(document.getElementById('addedNSpecies').value.trim());
    cValueMod = (parseFloat(document.getElementById('cValueMod').value) + 0.5)*2;
    bValueMod = (parseFloat(document.getElementById('bValueMod').value))*(2/2.5);


    validateInputs();

    pTOm = parseFloat(document.getElementById('pTOm').value.trim());
    b1 = parseFloat(document.getElementById('pBody1').value.trim());
    b2 = parseFloat(document.getElementById('pBody2').value.trim());
    b3 = parseFloat(document.getElementById('pBody3').value.trim());
    b4 = parseFloat(document.getElementById('pBody4').value.trim());
    b5 = parseFloat(document.getElementById('pBody5').value.trim());
    //console.log(b2)
    resetBoard();

    theWatcher = new dataCollection
    if ((climateFinished && climateByRnd.labels.length == nRnds) || (document.getElementsByName('climateOn')[0].checked == false)){
        GameLoop(nRnds,numberSpeciesInit,numberSpeciesAdd);
    } else {
        console.log('generate climate')
    }
    //testLoop(nRnds);
     

});

function resetBoard(){
    let all = plantSpeciesList.concat(meatSpeciesList);
    all.forEach((species) => {
        delete species;
    });
    plantSpeciesList = [];
    meatSpeciesList = [];
    deadSpeciesList = [];
    delete theWatcher;
}

class Species{
    constructor(speciesName, speciesSize, foodType, T1, T2, T3, T4){
        this.speciesName = speciesName;
        this.size = speciesSize;
        this.foodType = foodType;
        this.population = 1;
        this.foodEaten = 0;
        this.canEat = true;
        this.foodTotal = 0;
        this.roundsPlayed = 0;
        this.fat = 0;
        this.alive = true;
        this.eatingAttempts = 3;
        
        this.T1 = T1;
        this.T2 = T2;
        this.T3 = T3;
        this.T4 = T4;

        this.cooperationT;
        this.cooperationG = [];
        this.scavengerT = [];
        this.scavengerG = [];
        this.warningCallT = [];
        this.warningCallG = [];
        this.symbiosisT;
        this.symbiosisG = [];
    

    };
    get bite(){
        let bite = 1;
        if (this.T1.foraging || this.T2.foraging  || this.T3.foraging  || this.T4.foraging){
            bite += 1;
        }
        if (this.T1.intelligence || this.T2.intelligence || this.T3.intelligence || this.T4.intelligence){
            let prob = Math.random();
            if (prob >= 0.8){
                bite += 2;
            } else if(prob >= 0.4){
                bite += 1;
            }
        }
        return bite
    };
    get hunger(){
        if (this.T1.fatTissue || this.T2.fatTissue || this.T3.fatTissue || this.T4.fatTissue){
            return 2*this.population;
        } else {
            return this.population;
        };
    };
    get hibernation(){
        if (this.T1.hibernation || this.T2.hibernation|| this.T3.hibernation || this.T4.hibernation){
            return 2;
        } else {
            return 0;
        };
    };
    get initialEaten(){
        let initialEaten = 0;
        let cooperationInitial = 0
        try {
            cooperationInitial = this.cooperationT.initialEaten;
        } catch {
            cooperationInitial = 0;
        }
        
        if (this.T1.longNeck || this.T2.longNeck || this.T3.longNeck || this.T4.longNeck){
            if (this.T1.foraging || this.T2.foraging  || this.T3.foraging  || this.T4.foraging){
                initialEaten += 2;
                //return 2;
            } else {
                initialEaten += 1;
                //return 1;
            }; 
        } else if (cooperationInitial != 0){
            if (this.T1.foraging || this.T2.foraging  || this.T3.foraging  || this.T4.foraging){
                initialEaten += 2;
                //return 2;
            } else {
                initialEaten += 1;
                //return 1;
            }; 
        } //else {
            //return 0;
        //}
        return initialEaten;
    }
    get wantsFood(){
        var wants, howMuch, output;
        output = [wants,howMuch];
        howMuch = this.hunger - this.foodEaten;
        if (this.foodEaten < this.hunger){
            wants = true;
        } else {
            wants = false;
        };
        output = [wants,howMuch];
        return output;
    };
    get sizeO(){
        if (this.T1.packHunting || this.T2.packHunting || this.T3.packHunting || this.T4.packHunting){
            return this.size + this.population;
        } else {
            return this.size;
        };
    };
    get sizeD(){
        let newSize = this.size;
        if (this.T1.coolingFrills || this.T2.coolingFrills || this.T3.coolingFrills || this.T4.coolingFrills){
            newSize += 2;
        };
        if (this.T1.hardShell || this.T2.hardShell || this.T3.hardShell || this.T4.hardShell){
            newSize += 4;
        };
        return newSize;
    };
    get climbing(){
        if (this.T1.climbing || this.T2.climbing || this.T3.climbing || this.T4.climbing){
            return true;
        } else {
            return false;
        };
    };
    get ambush() {
        if (this.T1.ambush || this.T2.ambush || this.T3.ambush || this.T4.ambush){
            return true;
        } else {
            return false;
        }; 
    }
    get burrowing() {
        if (this.T1.burrowing || this.T2.burrowing || this.T3.burrowing || this.T4.burrowing){
            if (this.foodEaten >= this.population - this.hibernation ){
                return true;
            } else {
                return false;
            };
        } else {
            return false;
        };
    };
    get warningCall() {
        let warning = false;
        try {
            this.warningCallT.forEach((species) => {
                if (species.population != 0){
                    warning = true;
                }
            })
        } catch {
            warning = false;
        }
        return warning;
    };
    get intelligence() {
        if (this.T1.intelligence || this.T2.intelligence || this.T3.intelligence || this.T4.intelligence) {
            return true;
        } else {
            return false;
        }
    }
    get defensiveHerding() {
        if (this.T1.defensiveHerding || this.T2.defensiveHerding || this.T3.defensiveHerding || this.T4.defensiveHerding){
            return true;
        } else {
            return false;
        }
    }
    get fertile() {
        if ((this.T1.fertile || this.T2.fertile || this.T3.fertile || this.T4.fertile) && (foodAvailable > 0)){
            return 2;
        } else {
            return 1;
        }
    }
    get horns() {
        if (this.T1.horns || this.T2.horns || this.T3.horns || this.T4.horns){
            return true;
        } else {
            return false;
        }
    };
    get nocturnal() {
        if (this.T1.nocturnal || this.T2.nocturnal || this.T3.nocturnal || this.T4.nocturnal){
            return true;
        } else {
            return false;
        }
    };
    get mudWallowing() {
        if (this.T1.mudWallowing || this.T2.mudWallowing || this.T3.mudWallowing || this.T4.mudWallowing){
            return true;
        } else {
            return false;
        }
    };
    get migratory() {
        if (this.T1.migratory || this.T2.migratory || this.T3.migratory || this.T4.migratory){
            return true;
        } else {
            return false;
        }
    };
    get heavyFur() {
        if (this.T1.heavyFur || this.T2.heavyFur || this.T3.heavyFur || this.T4.heavyFur){
            return true;
        } else {
            return false;
        }
    }
    get coolingFrills() {
        if (this.T1.coolingFrills || this.T2.coolingFrills || this.T3.coolingFrills || this.T4.coolingFrills){
            return true;
        } else {
            return false;
        }
    };
    get climateBurrowing() {
        if (this.T1.burrowing || this.T2.burrowing || this.T3.burrowing || this.T4.burrowing){
            return true;
        } else {
            return false;
        }
    };

};

class Traits{
    constructor (traitName){
        this.traitName = traitName;
    }
    get packHunting() {
        if (this.traitName == 'packHunting'){
            return true
        } else {
            return false
        }
    }
    get climbing() {
        if (this.traitName == 'climbing'){
            return true
        } else {
            return false
        }
    }
    get burrowing() {
        if (this.traitName == 'burrowing'){
            return true
        } else {
            return false
        }
    }
    get fatTissue() {
        if (this.traitName == 'fatTissue'){
            return true
        } else {
            return false
        }
    }
    get hibernation() {
        if (this.traitName == 'hibernation'){
            return true
        } else {
            return false
        }
    }
    get foraging() {
        if (this.traitName == 'foraging'){
            return true
        } else {
            return false
        }
    }
    get hardShell() {
        if (this.traitName == 'hardShell'){
            return true
        } else {
            return false
        }
    }
    get coolingFrills() {
        if (this.traitName == 'coolingFrills'){
            return true
        } else {
            return false
        }
    }
    get longNeck() {
        if (this.traitName == 'longNeck'){
            return true;
        } else {
            return false;
        }
    }
    get cooperation() {
        if (this.traitName == 'cooperation'){
            return true;
        } else {
            return false;
        }
    }
    get scavenger() {
        if (this.traitName == 'scavenger'){
            return true;
        } else {
            return false;
        }
    }
    get ambush() {
        if (this.traitName == 'ambush'){
            return true;
        } else {
            return false;
        }
    }
    get warningCall() {
        if (this.traitName == 'warningCall'){
            return true;
        } else {
            return false;
        }
    }
    get symbiosis() {
        if (this.traitName == 'symbiosis'){
            return true;
        } else {
            return false;
        }
    }
    get migratory() {
        if (this.traitName == 'migratory'){
            return true;
        } else {
            return false;
        }
    }
    get intelligence() {
        if (this.traitName == 'intelligence'){
            return true;
        } else {
            return false;
        }
    };
    get defensiveHerding() {
        if (this.traitName == 'defensiveHerding'){
            return true;
        } else {
            return false;
        }
    };
    get fertile() {
        if (this.traitName == 'fertile'){
            return true;
        } else {
            return false;
        }
    };
    get horns() {
        if (this.traitName == 'horns'){
            return true;
        } else {
            return false;
        }
    };
    get nocturnal() {
        if (this.traitName == 'nocturnal'){
            return true;
        } else {
            return false;
        }
    };
    get mudWallowing() {
        if (this.traitName == 'mudWallowing'){
            return true;
        } else {
            return false;
        }
    };
    get heavyFur() {
        if (this.traitName == 'heavyFur'){
            return true;
        } else {
            return false;
        }
    };
    
};

//initializing the traits
let traitsPlantList = [];
let traitsMeatList = [];

let packHunting = new Traits('packHunting');
let climbing = new Traits('climbing');
let burrowing = new Traits('burrowing');
let fatTissue = new Traits('fatTissue');
let hibernation = new Traits('hibernation');
let foraging = new Traits('foraging');
let hardShell = new Traits('hardShell');
let coolingFrills = new Traits('coolingFrills');
let longNeck = new Traits('longNeck');
let cooperation = new Traits('cooperation');
let scavenger = new Traits('scavenger');
let ambush = new Traits('ambush');
let warningCall = new Traits('warningCall');
let symbiosis = new Traits('symbiosis');
let migratory = new Traits('migratory');
let intelligence = new Traits('intelligence');
let defensiveHerding = new Traits('defensiveHerding');
let fertile = new Traits('fertile');
let horns = new Traits('horns');
let nocturnal = new Traits('nocturnal');
let mudWallowing = new Traits('mudWallowing');
let heavyFur = new Traits('heavyFur');

let allTraits = [packHunting,climbing,burrowing,fatTissue,hibernation,foraging,hardShell,coolingFrills,longNeck,cooperation,scavenger,ambush,warningCall,symbiosis,migratory,intelligence,defensiveHerding,fertile,horns,nocturnal,mudWallowing,heavyFur];

traitsPlantList.push(climbing,burrowing,fatTissue,hibernation,foraging,hardShell,coolingFrills,longNeck,cooperation,warningCall,symbiosis,migratory,intelligence,defensiveHerding,fertile,horns,nocturnal,mudWallowing,heavyFur);

traitsMeatList.push(packHunting,climbing,burrowing,fatTissue,hibernation,hardShell,coolingFrills,scavenger,ambush,warningCall,symbiosis,migratory,intelligence,defensiveHerding,fertile,horns,nocturnal,mudWallowing,heavyFur);

function shuffleList(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0){
        randomIndex = Math.floor(Math.random()*currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array
};

function wateringHole (foodAvailable, foodRequested, roundStart, wateringHoleSize,numberRounds) {
    if (roundStart === true) {
        let n = numRandnum.value;
        let random = 0;
        let climateEffect = 0
        try{
            climateEffect = Math.abs(climateByRnd.data[climateByRnd.data.length - numberRounds]);
            if (climateEffect > 1){
                climateEffect = 1;
            }
        } catch{
            climateEffect = 0
        }
        
        let size = wateringHoleSize - climateEffect*wateringHoleSize

        while (n != 0 ){
            n--;
            let thing = 2*(Math.random() - 0.5)*size;
            random += thing;
            console.log(thing);
        };
        random = Math.floor(random/numRandnum.value);





        //let random = Math.floor((Math.random() - 0.5)*wateringHoleSize);
        let safety = size;


        console.log('double checking ' + random + ' ' + safety)


        foodAvailable = random + safety;//Math.floor((Math.random() - 0.5)*wateringHoleSize + wateringHoleSize);//wateringHoleSize);
        console.log('this is how much is available: ' + foodAvailable + ' ' + size)
    } 
    if (foodRequested > foodAvailable){
        if (foodAvailable > 0) {
            foodEaten = foodAvailable;
            foodAvailable = foodAvailable - foodEaten
        } else {
            foodEaten = 0
        };
    } else {
        foodAvailable = foodAvailable - foodRequested;
        foodEaten = foodRequested;
    }
    var list = [foodAvailable, foodEaten]
    return list
};

function cooperationFood (species){
    let luckyspecies = species.cooperationG;
    try {
        luckyspecies.forEach((luckyspecies) => {
            if (luckyspecies.population != 0){
                let bite = luckyspecies.bite
                if (bite > luckyspecies.wantsFood[1]){
                    let bite = species.wantsFood[1];
                    luckyspecies.foodEaten = luckyspecies.foodEaten + wateringHole(foodAvailable,bite,false,wateringHoleSize)[1];
                    foodAvailable = wateringHole(foodAvailable,bite,false,wateringHoleSize)[0];
                } else {
                    luckyspecies.foodEaten = luckyspecies.foodEaten + wateringHole(foodAvailable,bite,false,wateringHoleSize)[1];
                    foodAvailable = wateringHole(foodAvailable,bite,false,wateringHoleSize)[0];
                }
                console.log(luckyspecies.speciesName + ' benefited from cooperation with ' + species.speciesName);
            }
        })
    } catch {
        console.log('no "luckyspecies"');
    }
};

function scavengerFood (species) {
    let luckyspecies = species.scavengerG;
    try {
        luckyspecies.forEach((luckyspecies) => {
            if (luckyspecies.population != 0){
                if (1 <= luckyspecies.wantsFood[1]){
                    luckyspecies.foodEaten += 1;
                    console.log(luckyspecies.speciesName + ' scavanged from ' + species.speciesName);
                }
            }
        })
    } catch {
        console.log('no "luckyspecies"');
    }
};

function eatingAction(species, runningCondition) {
    if (species.foodType === 'plant'){
        
        if (species.population === 0 && species.canEat === true) {
            species.canEat = false;
            runningCondition--;
            console.log(runningCondition)
        } else if (species.canEat === true) {
            let bite = species.bite;
            if (bite > species.wantsFood[1]){
                let bite = species.wantsFood[1];
                species.foodEaten = species.foodEaten + wateringHole(foodAvailable,bite,false,wateringHoleSize)[1];
                foodAvailable = wateringHole(foodAvailable,bite,false,wateringHoleSize)[0];
                cooperationFood(species);
            } else {
                species.foodEaten = species.foodEaten + wateringHole(foodAvailable,bite,false,wateringHoleSize)[1];
                foodAvailable = wateringHole(foodAvailable,bite,false,wateringHoleSize)[0];
                cooperationFood(species);
            }
            console.log(species.speciesName + " ate " + species.foodEaten + ", wants food: " + species.wantsFood);
            
            console.log("available " + foodAvailable); 
            if (foodAvailable === 0 || species.wantsFood[0] === false) {
                species.canEat = false;
                runningCondition--;
                console.log(runningCondition)
            };

        }
    } else if (species.foodType === 'meat'){
        //console.log(species.canEat)
        if (species.canEat && species.wantsFood[0]) {
            let pray = pickPray(speciesList,species);
            console.log(pray)
            let unluckyspecies = pray[0];
            try {
                if (unluckyspecies.horns){
                    species.population--;
                }
                unluckyspecies.population--
                console.log(unluckyspecies.speciesName + ' got ate')
                if (unluckyspecies.size >= species.wantsFood[1]){
                    species.foodEaten += species.wantsFood[1];
                    scavengerFood(species);
                } else if (unluckyspecies.size < species.wantsFood[1]){
                    species.foodEaten += unluckyspecies.size;
                    scavengerFood(species);
                } else {
                    console.log('Error');
                };
                
            } catch {
                console.log(species.speciesName + 'is too small')
                species.eatingAttempts --;
                console.log(species.eatingAttempts)
            };
            
            if (species.eatingAttempts == 0){
                species.canEat = false;
            }
            
            console.log(species.speciesName + " ate " + species.foodEaten + ", wants food: " + species.wantsFood);
            if (species.canEat == false || species.wantsFood[0] === false) {
                species.canEat = false;
                console.log(species.speciesName + ' can eat: ' + species.canEat)
                runningCondition--;
                console.log(runningCondition);
            };
        } else if (species.population === 0 && species.canEat === true) {
            species.canEat = false;
            runningCondition--;
            console.log(runningCondition)
        } else if (species.canEat && species.wantsFood[0] == false){
            species.canEat = false;
            runningCondition--;
            console.log(runningCondition);
        };
    
    } else {
        console.log('foodType Error');
    };
    return runningCondition;
};

function eatingTurns(numberRounds) {
    speciesList = plantSpeciesList.concat(meatSpeciesList);
    console.log(speciesList);
    eatingOrder = shuffleList(speciesList);
    foodAvailable = Math.floor(wateringHole(foodAvailable,0,true,wateringHoleSize,numberRounds)[0]);
    theWatcher.initFood.push(foodAvailable);
    console.log('initial ' + foodAvailable);
    let runningCondition = (eatingOrder.filter(species => species.population != 0)).length;
    console.log(runningCondition);
    let count = 0;
    while (runningCondition != 0) {
        eatingOrder.forEach((species) => {
            if (count == 0){
                if (species.initialEaten > species.wantsFood[1] && species.canEat){
                    let wants = species.wantsFood[1];
                    species.foodEaten += wants;
                    console.log('species ' + species.speciesName + ' ate ' + wants + ' early');
                } else if (species.canEat){
                    species.foodEaten += species.initialEaten;
                    console.log('species ' + species.speciesName + ' ate ' + species.initialEaten + ' early');
                }
            }
            if (species.nocturnal && species.canEat){
                console.log('i am nocturnal')
                turnCondition = 0
                let livingCarnivores = meatSpeciesList.filter(animal => animal.population != 0 && animal.speciesName != species.speciesName);
                livingCarnivores.forEach((animal) => {
                    let pray = pickPray(speciesList,animal);
                    if ((pray.filter(pray => species.speciesName == pray.speciesName)).length != 0){
                        turnCondition ++;
                    };
                });
                //console.log(turnCondition)
                value = Math.random() + (0.5)**(turnCondition);
                console.log(value)
                if (value >= 1) {
                    //console.log(value);
                    console.log('can take extra turn')
                    runningCondition = eatingAction(species,runningCondition);
                };
            };

            runningCondition = eatingAction(species,runningCondition);
            //console.log(runningCondition);
                  
        });
        console.log('turn count: ' + count);
        if (count == 10000){
            console.log('eating Turns error');
            break;
        };
        count ++
    };
    if (foodAvailable == 0){
        console.log('Watering Hole is Empty')
    };
    
};

function pickPray(speciesList,species) {
    
    let prayEdible = [];
    let secondChoice = [];
    speciesList.forEach((pray) => {
        let edible = 0;
        if (pray.climbing == true && species.climbing == false){
            edible += 1;
            //console.log(pray.speciesName + ' can climb, i cant');
        };
        if (pray.burrowing) {
            edible += 1;
            //console.log(pray.speciesName + ' is burrowing ');
        };
        if (pray.warningCall && species.ambush == false) {
            edible += 1;
            //console.log(pray.speciesName + ' is protected by warning call')
        };
        if (pray.T1.symbiosis || pray.T2.symbiosis || pray.T3.symbiosis || pray.T4.symbiosis){
            if (pray.symbiosisT.size > pray.size || species.speciesName == pray.symbiosisT.speciesName){
                edible += 1;
            }
        };
        if (pray.defensiveHerding && pray.population >= species.population){
            edible += 1;
        };
        if (pray.mudWallowing && (Math.random() + 0.5) > 1) {
            edible += 1;
            //console.log('successfully wallowed')
        }

        goodPray = Math.random() + (0.5)**(edible);
        //console.log(0.5**edible)
        if (edible == 0 && pray.speciesName != species.speciesName && pray.population != 0 && species.sizeO > pray.sizeD) {
            //console.log('can eat ' + pray.speciesName);
            if (pray.horns){
                secondChoice.push(pray)
            } else {
                prayEdible.push(pray);
            }
            
        } else if (goodPray >= 1 && species.intelligence && pray.speciesName != species.speciesName && pray.population != 0 && species.sizeO > pray.sizeD){
            //console.log(goodPray)
            //console.log('bc intelligence... can eat ' + pray.speciesName);
            if (pray.horns){
                secondChoice.push(pray)
            } else {
                prayEdible.push(pray);
            }
        };
    });
    
    //console.log(prayEdible) ;
    prayEdible = shuffleList(prayEdible);
    secondChoice = shuffleList(secondChoice);
    secondChoice.forEach((species) => {
        prayEdible.push(species);
    });
    
    console.log('pray available for ' + species.speciesName + ': ' + prayEdible.length);
    
    return prayEdible;
};

function speciesGeneration(number, foodtype){
    while (number != 0){
        number--;
        speciesNumber++;
        let bodySize = Math.ceil(Math.random()*6);

        if (foodtype === 'plant'){
            let x = new Species('Species#' + speciesNumber.toString(), bodySize, foodtype, 1,1,1,1);
            plantSpeciesList.push(x);
        } else if (foodtype === 'meat'){
            let x = new Species('Species#' + speciesNumber.toString(), bodySize, foodtype, 1,1,1,1);
            meatSpeciesList.push(x);
        } else {
            console.log('foodtype error');
            break;
        };
        
    };
};

function randSpeciesGen (n,pTOm,b1,b2,b3,b4,b5) {
    while (n != 0){
        n--;
        speciesNumber++;

        let x = Math.random(), y = Math.random(), bodySize, foodType, traits;
        if (x <= b1){
            bodySize = 1;
        } else if (x <= b1 + b2){
            bodySize = 2;
        } else if (x <= b1 + b2 + b3){
            bodySize = 3;
        } else if (x <= b1 + b2 + b3 + b4){
            bodySize = 4;
        } else if (x <= b1 + b2 + b3 + b4 + b5){
            bodySize = 5;
        } else {
            bodySize = 6;
        };

        if (y <= pTOm){
            foodType = 'plant';
            traits = shuffleList(traitsPlantList)
        } else {
            foodType = 'meat';
            traits = shuffleList(traitsMeatList)
        };

        

        let species = new Species('Species#' + speciesNumber.toString(),bodySize,foodType,traits[0],traits[1],traits[2],traits[3])

        if (foodType === 'plant'){
            plantSpeciesList.push(species);
            allSpecies.push(species);
        } else {
            meatSpeciesList.push(species);
            allSpecies.push(species);
        };
    }
}

function endRound(numberRounds){
    theWatcher.remainingFood.push(foodAvailable);
    speciesList = plantSpeciesList.concat(meatSpeciesList);

    speciesList.forEach((species) => {
        //Migratory trait
        if ((species.T1.migratory || species.T2.migratory || species.T3.migratory || species.T4.migratory) && (foodAvailable == 0) && (species.population > 0)) {
            console.log(species.speciesName + ' beneffited from migtration');
            if (species.wantsFood > 0){
                cooperationFood(species)
            };
            if (2 > species.wantsFood[1]){
                species.foodEaten += species.wantsFood[1];
            } else {
                species.foodEaten += 2;
            };
            
        }
    })

    climateDeath(numberRounds);
    grabEveryThing(numberRounds);
    

    speciesList.forEach((species) => {

        

        if (species.foodEaten >= species.population && species.population + species.fertile <= maxpopulation && species.population != 0) {
            newPopulation = species.population + species.fertile; 
        } else if (species.foodEaten >= species.population && species.population < maxpopulation && species.population != 0) {
            newPopulation = species.population + 1; 
        } else if(species.population - species.hibernation > species.foodEaten) {
            newPopulation = species.foodEaten;
        } else {
            newPopulation = species.population;
        };
        if (newPopulation <= 0){
            newPopulation = 0;
            species.canEat = false;
            if (species.alive){
                species.alive = false;
                species.population = 0;
                //disconecting(species);
                deadSpeciesList.push(species);
            };
        };

        

        
        if (newPopulation != 0){
            species.roundsPlayed++;
            species.canEat = true;
            species.eatingAttempts = 3;
            //console.log(species.speciesName + ' can eat: ' + species.canEat)
        };

        if (species.T1.fatTissue || species.T2.fatTissue || species.T3.fatTissue || species.T4.fatTissue){
            if (species.foodEaten >= species.population){
                species.foodEaten = species.foodEaten - species.population;
                species.foodTotal += species.population;
            } else {
                species.foodTotal += species.foodEaten;
                species.foodEaten = 0;
            }
            species.population = newPopulation;
        } else {
            species.population = newPopulation;
            species.foodTotal += species.foodEaten;
            species.foodEaten = 0;
        };
    });

    

    plantSpeciesList = cleanOutDead(plantSpeciesList);
    meatSpeciesList = cleanOutDead(meatSpeciesList);
};

function grabEveryThing(numberRounds){
    theWatcher.rounds.unshift(numberRounds);
    let all = plantSpeciesList.concat(meatSpeciesList);
    
    // trait and Rnd data :(
    let biggerList = [];
    allTraits.forEach((trait)=> {
        let a = 0;
        let b = 0;
        let c = 0;
        let d = 0;
        let e = 0;
        all.forEach((species) => {
            if (species.T1.traitName == trait.traitName || species.T2.traitName == trait.traitName || species.T3.traitName == trait.traitName || species.T4.traitName == trait.traitName){
                if(species.roundsPlayed > 0){
                    a++;
                } else {
                    b++;
                };
                if (species.population <= 0){
                    species.population = 0;
                    c++;
                };
                d += species.foodEaten;
                e += species.population;
            }
        })
        let list = [a,b,c,d,e];
        biggerList.push(list)
    })
    traitRnd.push(biggerList);
    
    //get number that died
    numSpeciesDie = 0;
    all.forEach((species) =>{
        if (species.foodEaten == 0 || species.population == 0){
            numSpeciesDie ++;
        }
    })
    theWatcher.numSpeciesDie.push(numSpeciesDie);
    theWatcher.numSpeciesSurvive.push(all.length - numSpeciesDie);
    //get total amount eaten during the round
    let eaten = 0;
    all.forEach((species) => {
        if (species.foodEaten > species.population){
            eaten += species.population;
        } else {
            eaten += species.foodEaten;
        }
    })
    theWatcher.foodEaten.push(eaten);

    //get sum of populations
    let popu = 0;
    all.forEach((species) => {
        let add = 0
        if (species.population < 0){
            add = 0;
        } else {
            add = species.population;
        };
        popu += add;
    });
    theWatcher.sumPop.push(popu);

}

function climateDeath (numberRounds){
    let all = plantSpeciesList.concat(meatSpeciesList);
    let cValue = climateByRnd.data[climateByRnd.data.length - numberRounds]
    all.forEach((species) => {
        let traitMod = 0;
        if (cValue > 0 && species.nocturnal){
            traitMod -= 0.5;
        };
        if (cValue > 0 && species.mudWallowing){
            traitMod -= 0.5;
        };
        if (cValue > 0 && species.coolingFrills){
            traitMod -= 1.5;
        };
        if (cValue < 0 && species.hibernation == 2){
            traitMod -= 0.5;
        };
        if (cValue > 0 && species.heavyFur){
            traitMod += 0.5
        };
        if (cValue < 0 && species.heavyFur){
            traitMod -= 2;
        };
        if (species.burrowing){
            traitMod -= 0.5;
        };
        if (species.migratory){
            traitMod -= 0.5;
        };

        let loss = Math.floor((Math.random() - 0.5) + traitMod + (cValueMod*(Math.abs(cValue))) + bValueMod*((species.size - 3.5)*cValue));
        if (loss < 0){
            loss = 0;
        }
        if (species.population >= loss){
            species.population -= loss;
        } else {
            species.population = 0;
        }
        //theWatcher.loss.push(loss);
        //theWatcher.error.push([species,traitMod,cValue]);
        
    });
}

function cleanOutDead(speciesList){
    speciesAlive = speciesList.filter(species => species.alive == true);
    return speciesAlive;
}

class DisplaySpecies{
    constructor (speciesList){
        this.length = speciesList.length;
        this.speciesList = speciesList;
    }
    get livingSpecies(){
        let living = this.speciesList.filter(species => species.population != 0);
        living.forEach((species) => {
            let speciesName = species.speciesName;
            let population = species.population;
            let roundsPlayed = species.roundsPlayed;
            let foodTotal = species.foodTotal;
            let bodySize = species.size;
            let foodType = species.foodType;
            console.log(speciesName + '\t pop: ' + population  + '\t rndsPlyd: ' + roundsPlayed + '\t TtlFood: ' + foodTotal + '\n' + '\t bodySize: ' + bodySize + '\t Food Type: ' + foodType);
        });
    };
};

function GameLoop(numberRounds, numberSpeciesInit, numberSpeciesAdd){
    randSpeciesGen(numberSpeciesInit,pTOm,b1,b2,b3,b4,b5);
    //console.log(meatSpeciesList.concat(plantSpeciesList));
    //while (numberRounds != 0){
    let pause = setInterval(innerGameLoop,1);
    runFinished = false;
    function innerGameLoop() {
        
        countDown.innerText = numberRounds.toFixed();
        
        randSpeciesGen(numberSpeciesAdd,pTOm,b1,b2,b3,b4,b5);
        //console.log(meatSpeciesList.concat(plantSpeciesList))
        meatSpeciesList.concat(plantSpeciesList).forEach((species) => {
            connecting(species);
        })
        eatingTurns(numberRounds);
        endRound(numberRounds)//plantSpeciesList, meatSpeciesList);
        //let x = new DisplaySpecies(plantSpeciesList);
        //x.livingSpecies;
        numberRounds--;
        countDown.innerText = 'Progress: Rounds remaining: ' + numberRounds.toFixed();
        if (numberRounds <= 0){
            countDown.innerText = 'Progress: Done';
            runFinished = true;
            clearInterval(pause);
            let x = new DisplaySpecies(plantSpeciesList);
            x.livingSpecies;
            let y = new DisplaySpecies(meatSpeciesList);
            y.livingSpecies;j
            console.log(deadSpeciesList);
            console.log(theWatcher);    
        }
    };
    let x = new DisplaySpecies(plantSpeciesList);
    x.livingSpecies;
    let y = new DisplaySpecies(meatSpeciesList);
    y.livingSpecies;
};

function connecting(animal){
    if (animal.population != 0){
        if (animal.T1.cooperation || animal.T2.cooperation || animal.T3.cooperation || animal.T4.cooperation){
            try {
                if (animal.cooperationT.population == 0){
                    let living = plantSpeciesList.filter(species => species.population != 0 && species.speciesName != animal.speciesName);
                //console.log(living);
                    try {
                        let partner = shuffleList(living)[0];
                        partner.cooperationG.push(animal);
                        animal.cooperationT = partner;
                        console.log(animal.speciesName + ' cooperates with ' + partner.speciesName);
                    } catch {
                        console.log('no avaible partner');
                    }
                }
            } catch {
                let living = plantSpeciesList.filter(species => species.population != 0 && species.speciesName != animal.speciesName);
                //console.log(living);
                try {
                    let partner = shuffleList(living)[0];
                    partner.cooperationG.push(animal);
                    animal.cooperationT = partner;
                    console.log(animal.speciesName + ' cooperates with ' + partner.speciesName);
                } catch {
                    console.log('no avaible partner');
                }
            }
        }
        if (animal.T1.symbiosis || animal.T2.symbiosis || animal.T3.symbiosis || animal.T4.symbiosis){
            try {
                if (animal.symbiosisT.population == 0){
                    let allAnimals = meatSpeciesList.concat(plantSpeciesList);
                    let living = shuffleList(allAnimals.filter(species => species.population != 0 && species.speciesName != animal.speciesName));
                //console.log(living);
                    try {
                        let partner = shuffleList(living)[0];
                        partner.symbiosisG.push(animal);
                        animal.symbiosisT = partner;
                        console.log(animal.speciesName + ' has symbiosis with ' + partner.speciesName);
                    } catch {
                        console.log('no avaible partner');
                    }
                }
            } catch {
                let allAnimals = meatSpeciesList.concat(plantSpeciesList);
                let living = shuffleList(allAnimals.filter(species => species.population != 0 && species.speciesName != animal.speciesName));
                //console.log(living);
                try {
                    let partner = shuffleList(living)[0];
                    partner.symbiosisG.push(animal);
                    animal.symbiosisT = partner;
                    console.log(animal.speciesName + ' has symbiosis with ' + partner.speciesName);
                } catch {
                    console.log('no avaible partner');
                }
            }
        }

        if (animal.T1.scavenger || animal.T2.scavenger || animal.T3.scavenger || animal.T4.scavenger){
            let living = shuffleList(meatSpeciesList.filter(species => species.population != 0));
            //console.log(living);
            try {
                let animalsHave = animal.scavengerT.filter(species => species.population != 0);
                let animalsNeeded = 3 - animalsHave.length;
                let animalsAvailable = [];
                living.forEach((carnivore) => {
                    if (animalsHave.filter(species => species.speciesName == carnivore.speciesName).length == 0){
                        animalsAvailable.push(carnivore);
                    }
                });
                console.log(animalsAvailable)
                console.log('animals needed: ' + animalsNeeded + ' living: ' + animalsAvailable.length)
                if (animalsNeeded == 3 && animalsAvailable.length >= 3){
                    animalsHave.push(animalsAvailable[0],animalsAvailable[1],animalsAvailable[2]);
                    
                    animalsAvailable[0].scavengerG.push(animal);
                    animalsAvailable[1].scavengerG.push(animal);
                    animalsAvailable[2].scavengerG.push(animal);
                    animal.scavengerT = animalsHave;
                    console.log(animal.speciesName + ' scavenges from:')
                    console.log(animalsHave);
                } else if (animalsNeeded == 3 && animalsAvailable.length >= 2){
                    animalsHave.push(animalsAvailable[0],animalsAvailable[1]);
                    animalsAvailable[0].scavengerG.push(animal);
                    animalsAvailable[1].scavengerG.push(animal);
                    animal.scavengerT = animalsHave;
                    console.log(animal.speciesName + ' scavenges from:')
                    console.log(animalsHave);
                } else if (animalsNeeded == 3 && animalsAvailable.length >= 1){
                    animalsHave.push(animalsAvailable[0]);
                    animalsAvailable[0].scavengerG.push(animal);
                    animal.scavengerT = animalsHave;
                    console.log(animal.speciesName + ' scavenges from:')
                    console.log(animalsHave);
                } else if (animalsNeeded == 2 && animalsAvailable.length >=1){
                    try {
                        animalsHave.push(animalsAvailable[0],animalsAvailable[1]);
                        animalsAvailable[0].scavengerG.push(animal);
                        animalsAvailable[1].scavengerG.push(animal);
                    } catch {
                        animalsHave.push(animalsAvailable[0]);
                        animalsAvailable[0].scavengerG.push(animal);
                    }
                    animal.scavengerT = animalsHave;
                    console.log(animal.speciesName + ' scavenges from:')
                    console.log(animalsHave);
                } else if (animalsNeeded == 1 && animalsAvailable.length >=1){
                    animalsHave.push(animalsAvailable[0]);
                    animalsAvailable[0].scavengerG.push(animal); 
                    animal.scavengerT = animalsHave;
                    console.log(animal.speciesName + ' scavenges from:')
                    console.log(animalsHave);
                } else if (animalsNeeded >= 1 && animalsAvailable.length == 0){
                    console.log('no available living species');
                    animalsHave.push();
                    animal.scavengerT = animalsHave;
                    console.log(animal.speciesName + ' scavenges from:')
                    console.log(animalsHave);
                }
                console.log('completed Try')
            } catch  {
                console.log(animal.speciesName + ' scavenges from:')
                if (living.length >= 3) {
                    let partners = [living[0],living[1],living[3]];
                    living[0].scavengerG.push(animal);
                    living[1].scavengerG.push(animal);
                    living[3].scavengerG.push(animal);
                    animal.scavengerT = partners;
                    console.log(partners);
                } else if (living.length >= 2){
                    let partners = [living[0],living[1]];
                    living[0].scavengerG.push(animal);
                    living[1].scavengerG.push(animal);
                    animal.scavengerT = partners;
                    console.log(partners);
                } else if (living.length == 1){
                    let partners = [living[0]];
                    living[0].scavengerG.push(animal);
                    console.log(partners);
                    animal.scavengerT = partners;
                } else if (living.length == 0){
                    console.log('no living species');
                    let partners = [];
                    animal.scavengerT = partners;
                    console.log(partners);
                } else {
                    console.log('partner error');
                };
            };
                
        }
        if (animal.T1.warningCall || animal.T2.warningCall || animal.T3.warningCall || animal.T4.warningCall){
            let allAnimals = meatSpeciesList.concat(plantSpeciesList);
            let living = shuffleList(allAnimals.filter(species => species.population != 0 && species.speciesName != animal.speciesName));
            try {
                let animalsHave = animal.warningCallG.filter(species => species.population != 0);
                let animalsNeeded = 2 - animalsHave.length;
                
                //console.log(animalsHave);
                //console.log(animalsNeeded);
                //console.log(living.length);
                if (animalsNeeded == 2 && living.length >= 2){
                    animalsHave.push(Living[0],Living[1]);
                    living[0].warningCallT.push(animal);
                    living[1].warningCallT.push(animal);
                    animal.warningCallG = animalsHave;
                    console.log(animal.speciesName + ' warns:')
                    console.log(animalsHave);
                } else if (animalsNeeded >= 1 && living.length >= 1){
                    let availableLiving = living.filter(species => species.speciesName != animal.warningCallG[0].speciesName)
                    animalsHave.push(availableLiving[0]);
                    availableLiving[0].warningCallT.push(animal);
                    animal.warningCallG = animalsHave;
                    console.log(animal.speciesName + ' warns:')
                    console.log(animalsHave);
                } else if (animalsNeeded >= 1 && living.length == 0){
                    console.log('no living species');
                    animalsHave.push();
                    animal.warningCallG = animalsHave;
                    console.log(animal.speciesName + ' warns:')
                    console.log(animalsHave);
                } else {
                    //console.log('error');
                    //console.log(animalsHave);
                };
            } catch  {
                console.log(animal.speciesName + ' warns:')
                if (living.length >= 2){
                    let partners = [living[0],living[1]];
                    living[0].warningCallT.push(animal);
                    living[1].warningCallT.push(animal);
                    animal.warningCallG = partners;
                    console.log(partners);
                } else if (living.length == 1){
                    let partners = [living[0]];
                    living[0].warningCallT.push(animal);
                    console.log(partners);
                    animal.warningCallG = partners;
                } else if (living.length == 0){
                    console.log('no living species');
                    let partners = [];
                    animal.warningCallG = partners;
                    console.log(partners);
                } else {
                    console.log('partner error');
                };;
            }   
        }
    };
};

function disconecting(deadAnimal){
    console.log('disconnecting ' + deadAnimal.speciesName)
    luckyspecies = deadAnimal.cooperationG.concat(deadAnimal.scavengerG);
    console.log(luckyspecies)
    luckyspecies.forEach((luckyspecies) => {
        //console.log('got here')
        if (luckyspecies.population != 0){
            //console.log('also got here')
            connecting(luckyspecies)
        }
    })   
};

function testLoop(numberRounds){
    let mouse = new Species('mouse', 1,'plant',1,1,fatTissue,burrowing);
    let chicken = new Species('chicken', 2,'plant',intelligence,warningCall,defensiveHerding,fertile);
    let cow = new Species('cow',5,'plant',foraging,horns,mudWallowing,1);
    let squirrel = new Species('squirrel', 1, 'plant', climbing,1,1,1);
    let turtle = new Species('turtle',2,'plant',hardShell,1,1,1);
    let giraffe = new Species('giraffe', 4, 'plant', longNeck, foraging,horns,1)
    let someBird = new Species('someBird', 1, 'plant', symbiosis,1,1,1);
    let gazelle = new Species('gazelle',3,'plant',migratory,1,1,1);

    let komodoDragon = new Species('komodoDragon', 3, 'meat',coolingFrills,scavenger,1,1);
    let wolf = new Species('wolf', 3, 'meat',packHunting,intelligence,1,scavenger);
    let bear = new Species('bear', 6, 'meat',nocturnal,intelligence,ambush,hibernation);
    let raccoon = new Species('raccoon', 2, 'meat', climbing, burrowing, scavenger, 1);

    //plantSpeciesList.push(chicken,cow,squirrel,turtle,giraffe,mouse,someBird,gazelle);
    //meatSpeciesList.push(wolf,bear,komodoDragon,raccoon);
    plantSpeciesList.push(chicken,squirrel)
    meatSpeciesList.push(raccoon,wolf)//,komodoDragon)//,raccoon,komodoDragon)
    plantSpeciesList.concat(meatSpeciesList).forEach((species) => {
        connecting(species)
    });
    while (numberRounds != 0){
        plantSpeciesList.concat(meatSpeciesList).forEach((species) => {
            connecting(species)
        });
        eatingTurns(plantSpeciesList,meatSpeciesList);
        endRound(plantSpeciesList,meatSpeciesList);
        plantSpeciesList.concat(meatSpeciesList).forEach((species) => {
            connecting(species)
        });
        let x = new DisplaySpecies(plantSpeciesList);
        let y = new DisplaySpecies(meatSpeciesList);
        x.livingSpecies;
        y.livingSpecies;
        numberRounds--;
    };
    
};

function buildNewChart(DATA,chartType) {
    //console.log(avgLifeByTrait)
    const labels = DATA.labels
    
    const lMin = document.getElementById('lMin').value;
    const lMax = document.getElementById('lMax').value;
    
    const rMin = document.getElementById('rMin').value;
    const rMax = document.getElementById('rMax').value;

    const data = {
        labels: labels,
        datasets: [
            {
            label: DATA.label,
            data: DATA.data,
            borderColor: 'rgba(192,57,43,0.1)',
            backgroundColor: DATA.color, // 
            borderColor: DATA.color,
            borderWidth: 2,
            yAxisID: DATA.yAxisID,
            }
        ]
    }
    const configure = {
        type: chartType,
        data: data,
        options: {
          responsive: true,
          aspectRatio: 2,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'barChartTrait'
            }
          },
          scales:{
            y1: {
                type: 'linear',
                display: true,
                position: 'left',
                suggestedMin: lMin,
                suggestedMax: lMax,
            },
            y2: {
                type: 'linear',
                display: true,
                position: 'right',
                suggestedMin: rMin,
                suggestedMax: rMax,
            }
          }
        },
    };
    console.log(configure);
    return configure;
}

function addData(chart,DATA){
    //const data = chart.data;
    //console.log(DATA)
    const newDataset = {
        label: DATA.label,
        backgroundColor: DATA.color,
        borderColor: DATA.color,
        borderWidth: 2,
        data: DATA.data,
        yAxisID: DATA.yAxisID
      };
    //console.log(newDataset)
    //console.log(chart.data)
    if ((chart.data.datasets.filter(dataset => dataset.label == newDataset.label)).length == 0){
        chart.data.datasets.push(newDataset);
    }
    chart.update();
}

function initTraitRnd(){
    let start = Math.floor(document.getElementById('rStart').value);
    let end = Math.floor(document.getElementById('rEnd').value);
    if (start < 1){
        start = 1;
    };
    if (end > document.getElementById('nRnds').value){
        end = document.getElementById('nRnds').value;
    }
    if (start > end && start < document.getElementById('nRnds').value){
        end = start;
    } else if (start>end){
        start = end
    }
    document.getElementById('rStart').value = start;
    document.getElementById('rEnd').value = end;

    //now the math :(

    let item1 = [];
    let item2 = [];
    let item3 = [];
    let item4 = [];
    for(j = 0; j < allTraits.length; j++){
        let addSum = 0;
        let deadSum = 0;
        let foodSum = 0;
        let popSum = 0;
        let survivedSum = 0;
        let playerSum = 0;
        for(i = start - 1; i < end; i++){
            let a = traitRnd[i][j][0];
            let b = traitRnd[i][j][1];
            let c = traitRnd[i][j][2];
            let d = traitRnd[i][j][3];
            let e = traitRnd[i][j][4];

            survivedSum += (a+b-c);
            playerSum += (a + b);
            addSum += b;
            deadSum += c;
            foodSum += d;
            popSum += e;
            
        }
        let tCount = traitRnd[start - 1][j][0] + addSum;
        let avgRndsSurvived = survivedSum/tCount;
        let avgFoodEaten = foodSum/tCount;
        let avgPop = popSum/playerSum;

        item1.push(allTraits[j].traitName);
        if (tCount && playerSum > 0){
            
            item2.push(avgRndsSurvived);
            item3.push(avgFoodEaten);
            item4.push(avgPop);
        } else {
            item2.push(0);
            item3.push(0);
            item4.push(0);
        }

    }
    avgLifeByTrait.label = 'Average #of Rnds Survived by Trait';
    avgLifeByTrait.labels = item1;
    avgLifeByTrait.data = item2;

    avgFoodByTrait.label = 'Average #of Food Eaten by Trait';
    avgFoodByTrait.labels = item1;
    avgFoodByTrait.data = item3;

    avgPopByTrait.label = 'Average Population by Trait';
    avgPopByTrait.labels = item1;
    avgPopByTrait.data = item4;

}

const printTBarChart = document.getElementById("printTBarChart");
printTBarChart.addEventListener("click", function(){
    //Init theWatcher
    try{
        theWatcher.RelativebyTrait;
    } catch {
        console.log('data not gernerated')
    }
    
    initTraitRnd();

    cc = 0;
    byTraitList.forEach((item) => {
        item.color = backgroundColorList[cc];
        cc++;
    })

    //for Bar Chart
    try {
        dataChart.destroy()
    } catch {}
    let tBarToDo = [];
    const tBarChecked = document.getElementsByName('traitBarChart');

    for (let i = 0; i < tBarChecked.length; i++){
        if(tBarChecked[i].checked){
            tBarToDo.push(byTraitList[i]);
        }
    };
    //console.log(tBarToDo)
    if(tBarToDo.length >= 1){
        dataChart = new Chart(
            document.getElementById('chart'),
            buildNewChart(tBarToDo[0],'bar')
        );
        for (let i = 1; i < tBarToDo.length; i++){
            addData(dataChart,tBarToDo[i])
        }
    }
    
    console.log(traitRnd)
});

const printLineChart = document.getElementById("printLineChart");
printLineChart.addEventListener("click", function(){
    //Init theWatcher
    try{
        theWatcher.byRnd;
        //console.log(theWatcher)
    } catch {
        console.log('data not gernerated')
    }
    //console.log(theWatcher)

//assign colors
    cc = 0;
    lineList.forEach((item) => {
        item.color = backgroundColorList[cc];
        cc++;
    })

    //for line Chart
    try {
        dataChart.destroy()
    } catch {}
    let lineToDo = [];
    const lineChecked = document.getElementsByName('lineChart');

    for (let i = 0; i < lineChecked.length; i++){
        if(lineChecked[i].checked){
            lineToDo.push(lineList[i]);
        }
    };
    console.log(lineToDo)
    if(lineToDo.length >= 1){
        dataChart = new Chart(
            document.getElementById('chart'),
            buildNewChart(lineToDo[0],'line')
        );
        for (let i = 1; i < lineToDo.length; i++){
            addData(dataChart,lineToDo[i])
        }
    }
    
    //console.log(chartContainer)
})
    
function initRun(){
    let initCountDown1 = document.getElementById('initCountDown1');
    let initCountDown2 = document.getElementById('initCountDown2');
    initCountDown1.innerText = '>>> generating initial climate'
    climate()
    let initRunPause = setInterval(initSim,200);
    function initSim(){
        console.log('we here')
        initCountDown1.innerText += ' .'
        if (climateFinished){
            initCountDown1.innerText += ' . Done'
            initCountDown2.innerText = '>>> calculating initial run'
            console.log('no we here')
            let nRnds = parseFloat(document.getElementById('nRnds').value.trim());
            wateringHoleSize = parseFloat(document.getElementById('wateringHoleSize').value.trim());
            let numberSpeciesInit = parseFloat(document.getElementById('initialNSpecies').value.trim());
            let numberSpeciesAdd = parseFloat(document.getElementById('addedNSpecies').value.trim());
            cValueMod = (parseFloat(document.getElementById('cValueMod').value) + 0.5)*2;
            bValueMod = (parseFloat(document.getElementById('bValueMod').value))*(2/2.5);
        
        
            validateInputs();
        
            pTOm = parseFloat(document.getElementById('pTOm').value.trim());
            b1 = parseFloat(document.getElementById('pBody1').value.trim());
            b2 = parseFloat(document.getElementById('pBody2').value.trim());
            b3 = parseFloat(document.getElementById('pBody3').value.trim());
            b4 = parseFloat(document.getElementById('pBody4').value.trim());
            b5 = parseFloat(document.getElementById('pBody5').value.trim());
            //console.log(b2)
            resetBoard();
        
            theWatcher = new dataCollection
            if ((climateFinished && climateByRnd.labels.length == nRnds) || (document.getElementsByName('climateOn')[0].checked == false)){
                GameLoop(nRnds,numberSpeciesInit,numberSpeciesAdd);
            } else {
                console.log('generate climate')
            }
            clearInterval(initRunPause)
        }
        console.log('got all the way here')
    };
    let initPlotPause = setInterval(initPlot,200)
    function initPlot(){
        initCountDown2.innerText += ' .'
        if (runFinished){
            initCountDown1.innerText = ''
            initCountDown2.innerText = ''
            try{
                theWatcher.byRnd;
                //console.log(theWatcher)
            } catch {
                console.log('data not gernerated')
            }
            //console.log(theWatcher)
        
        //assign colors
            cc = 0;
            lineList.forEach((item) => {
                item.color = backgroundColorList[cc];
                cc++;
            })
        
            //for line Chart
            try {
                dataChart.destroy()
            } catch {}
            let lineToDo = [];
            const lineChecked = document.getElementsByName('lineChart');
        
            for (let i = 0; i < lineChecked.length; i++){
                if(lineChecked[i].checked){
                    lineToDo.push(lineList[i]);
                }
            };
            console.log(lineToDo)
            if(lineToDo.length >= 1){
                dataChart = new Chart(
                    document.getElementById('chart'),
                    buildNewChart(lineToDo[0],'line')
                );
                for (let i = 1; i < lineToDo.length; i++){
                    addData(dataChart,lineToDo[i])
                }
            }
            clearInterval(initPlotPause)
        }
        
    }


}

initRun()

//testLoop(3)

//console.log(deadSpeciesList);

//GameLoop(20,20,4);
//speciesGeneration(10, 'meat');
//speciesGeneration(10, 'plant');
//console.log(meatSpeciesList.concat(plantSpeciesList))