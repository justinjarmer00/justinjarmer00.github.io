const form = document.getElementById('form');
const numCarts = document.getElementById('numCarts');
const lwp = document.getElementById('lwp');
const rwp = document.getElementById('rwp');
const sloMo = document.getElementById('sloMp');
const in1 = document.getElementById('in1');
const in2 = document.getElementById('in2');
const in3 = document.getElementById('in3');
const in4 = document.getElementById('in4');
const ma1 = document.getElementById('ma1');
const ma2 = document.getElementById('ma2');
const ma3 = document.getElementById('ma3');
const ma4 = document.getElementById('ma4');
const sp1 = document.getElementById('sp1');
const sp2 = document.getElementById('sp2');
const sp3 = document.getElementById('sp3');
const sp4 = document.getElementById('sp4');
const sp5 = document.getElementById('sp5');
var x1 = [[0],[0]];
var x2 = [[0],[0]];
var x3 = [[0],[0]];
var x4 = [[0],[0]];
var count = 0;
const simClock = document.getElementById('simTime');
const cart1Count = document.getElementById('cart1Count');
var count1 = 0;
const cart2Count = document.getElementById('cart2Count');
var count2 = 0;
const cart3Count = document.getElementById('cart3Count');
var count3 = 0;
const cart4Count = document.getElementById('cart4Count');
var count4 = 0;
const frq1 = document.getElementById('frq1');
const frq2 = document.getElementById('frq2');
const frq3 = document.getElementById('frq3');
const frq4 = document.getElementById('frq4');
var simTime = 0;
var start = false;
const countTitle = document.getElementById('countTitle');
countTitle.style.left = '5%';
const frqTitle = document.getElementById('frqTitle');
frqTitle.style.left = '5%';
frqTitle.style.bottom = '0%';
const cart1Title = document.getElementById('cart1Title');
cart1Title.innerText = 'Cart 1';
cart1Title.style.left = '25%';
cart1Title.style.bottom = '20%';
const cart2Title = document.getElementById('cart2Title');
cart2Title.innerText = 'Cart 2';
cart2Title.style.left = '40%';
cart2Title.style.bottom = '20%';
const cart3Title = document.getElementById('cart3Title');
cart3Title.innerText = 'Cart 3';
cart3Title.style.left = '55%';
cart3Title.style.bottom = '20%';
const cart4Title = document.getElementById('cart4Title');
cart4Title.innerText = 'Cart 4';
cart4Title.style.left = '70%';
cart4Title.style.bottom = '20%';

const matrixA = [[1,2],[4,5]];
const matrixB = [[1,1],[1,1]];
const arrayC = [4,5]
const array = [[4],[0]];
//const array = math.transpose(arrayC);
const matrix = math.add(matrixA,matrixB);
console.log(matrix);
console.log(arrayC)
console.log(array);
console.log(matrixA[1][0])

window.requestAnimationFrame(main)

form.addEventListener('submit', e => {
    e.preventDefault();

    clearError(lwp);
    clearError(rwp);
    clearError(in1);
    clearError(in2);
    clearError(in3);
    clearError(in4);
    clearError(ma1);
    clearError(ma2);
    clearError(ma3);
    clearError(ma4);
    clearError(sp1);
    clearError(sp2);
    clearError(sp3);
    clearError(sp4);
    clearError(sp5);
    
    start = validateInputs();
    console.log(start);
    if(start==true){
        window.requestAnimationFrame(main)
    } else {
        console.log('not true')
    };
    console.log(sp1.value.trim());
});

const stopBtn = document.getElementById("stopBtn");
stopBtn.addEventListener("click", function(){
    console.log("STOP");
    start = false;
});



const clearError = element => {
    const inputControl = element.parentElement;
    inputControl.classList.remove('error');
    inputControl.classList.remove('success');
};

const setError = (element, message) => {
    const inputControl = element.parentElement;

    inputControl.classList.add('error');
    inputControl.classList.remove('success')
}

const setSuccess = element => {
    const inputControl = element.parentElement;

    inputControl.classList.add('success');
    inputControl.classList.remove('error');
};

const validateInputs = () => {
    const numCartsValue = numCarts.value.trim();
    const lwpValue = lwp.value.trim();
    const rwpValue = rwp.value.trim();
    const in1Value = in1.value.trim();
    const in2Value = in2.value.trim();
    const in3Value = in3.value.trim();
    const in4Value = in4.value.trim();
    const ma1Value = ma1.value.trim();
    const ma2Value = ma2.value.trim();
    const ma3Value = ma3.value.trim();
    const ma4Value = ma4.value.trim();
    const sp1Value = sp1.value.trim();
    const sp2Value = sp2.value.trim();
    const sp3Value = sp3.value.trim();
    const sp4Value = sp4.value.trim();
    const sp5Value = sp5.value.trim();

    var validate = true;

    if(numCartsValue > 1){
        if(lwpValue === ''){
            setError(lwp, 'required')
            var validate = false
        } else {
            setSuccess(lwp)
        };
        if(rwpValue === '' || rwpValue < lwpValue){
            setError(rwp, 'required')
            var validate = false
        } else {
            setSuccess(rwp)
        };
        if(in1Value === ''){
            setError(in1, 'required')
            var validate = false
        } else {
            setSuccess(in1)
        };
        if(in2Value === ''){
            setError(in2, 'required')
            var validate = false
        } else {
            setSuccess(in2)
        };
        if(ma1Value === '' || ma1Value < 0){
            setError(ma1, 'required')
            var validate = false
        } else {
            setSuccess(ma1)
        };
        if(ma2Value === '' || ma1Value < 0){
            setError(ma2, 'required')
            var validate = false
        } else {
            setSuccess(ma2)
        };
        if(sp1Value === ''){
            setError(sp1, 'required')
            var validate = false
        } else {
            setSuccess(sp1)
        };
        if(sp2Value === ''){
            setError(sp2, 'required')
            var validate = false
        } else {
            setSuccess(sp2)
        };
        if(sp3Value === ''){
            setError(sp3, 'required')
            var validate = false
        } else {
            setSuccess(sp3)
        };
    };

    if(numCartsValue > 2){
        if(in3Value === ''){
            setError(in3, 'required')
            var validate = false
        } else {
            setSuccess(in3)
        };
        if(ma3Value === '' || ma1Value < 0){
            setError(ma3, 'required')
            var validate = false
        } else {
            setSuccess(ma3)
        };
        if(sp4Value === ''){
            setError(sp4, 'required')
            var validate = false
        } else {
            setSuccess(sp4)
        };   
    };
    if(numCartsValue > 3){
        if(in4Value === ''){
            setError(in4, 'required')
            var validate = false
        } else {
            setSuccess(in4)
        };
        if(ma4Value === '' || ma1Value < 0){
            setError(ma4, 'required')
            var validate = false
        } else {
            setSuccess(ma4)
        };
        if(sp5Value === ''){
            setError(sp5, 'required')
            var validate = false
        } else {
            setSuccess(sp5)
        };
    };
    return validate;
};

let lastRenderTime = 0;
const fps = 100;

var start = true

function main(currentTime) {
    
    stopBtn.addEventListener("click", function(){
        console.log("STOP");
        start = false;

    });
    if(start==true){
        window.requestAnimationFrame(main)
    };
    var dt = (currentTime - lastRenderTime)/1000;
    console.log(start)
    if (dt < 1/fps) return
    lastRenderTime = currentTime;
    update(dt);
    
      
}



function update(dt) {
    const numCartsValue = numCarts.value.trim();
    const lwpValue = parseFloat(lwp.value.trim()/100); //cm to m
    const rwpValue = parseFloat(rwp.value.trim()/100);
    const in1Value = parseFloat(in1.value.trim()/100);
    const in2Value = parseFloat(in2.value.trim()/100);
    const in3Value = parseFloat(in3.value.trim()/100)
    const in4Value = parseFloat(in4.value.trim()/100);
    const ma1Value = parseFloat(ma1.value.trim()/1000);
    const ma2Value = parseFloat(ma2.value.trim()/1000);
    const ma3Value = parseFloat(ma3.value.trim()/1000);
    const ma4Value = parseFloat(ma4.value.trim()/1000); //g to kg
    const sp1Value = parseFloat(sp1.value.trim());
    const sp2Value = parseFloat(sp2.value.trim());
    const sp3Value = parseFloat(sp3.value.trim());
    const sp4Value = parseFloat(sp4.value.trim());
    const sp5Value = parseFloat(sp5.value.trim());
        
    let cart1 = document.querySelector('.cart1');
    let cart2 = document.querySelector('.cart2');
    let cart3 = document.querySelector('.cart3');
    let cart4 = document.querySelector('.cart4');
    let spPng11 = document.getElementById('spPng11');
    let spPng21 = document.getElementById('spPng21');
    let spPng31 = document.getElementById('spPng31');
    let spPng41 = document.getElementById('spPng41');
    let spPng51 = document.getElementById('spPng51');

    cart1Title.innerText = '';
    cart2Title.innerText = '';
    cart3Title.innerText = '';
    cart4Title.innerText = '';
    const boxWidth = document.getElementById('p-box').clientWidth;

    const spPng = document.getElementById('spPng');

    stopBtn.addEventListener("click", function(){
        console.log("STOP");
        start = false;
        count = 0;

    });

    var Vo = new Array([[0],[0]]);
    //var K = 
    if(numCartsValue == '2'){
        console.log("2");
        const scale_w = rwpValue - lwpValue;
        const scale_r = scale_w/1000; //screen width
        const eqdis1 = 1*(1000/(parseFloat(numCartsValue) + 1));
        const eqdis2 = 2*(1000/(parseFloat(numCartsValue) + 1));
        console.log(scale_r);
        console.log(eqdis1);
        console.log(eqdis2);
        console.log(in1Value);
        console.log(count);
        if(dt>0.01){
            dt = 0.01
        };
        if(count < 10){
            console.log('true');
            console.log();
            //x1[0][0] = parseFloat(eqdis1 + in1Value/scale_r);        //[[eqdis1 + in1Value/scale_r],[0]];
            x2 = [[eqdis2 + in2Value/scale_r],[0]];
            x1 = [[eqdis1 + in1Value/scale_r],[0]];
            dt = 0;
            simTime = 0;
            if(count>8){
                count1 = 0;
                count2 = 0;
                count3 = 0;
                count4 = 0;
                cart1Count.innerText = ''
                cart2Count.innerText = ''
                cart3Count.innerText = ''
                cart4Count.innerText = ''
                frq1.innerText = '';
                frq2.innerText = '';
                frq3.innerText = '';
                frq4.innerText = ''; 
            }
            //x1[0] = ;
            //x2[0] = ;
        };
        console.log(x1[0][0]);
        console.log(x2[0][0])
        try {
            let vox1 = parseFloat(x1[1][0]);
            let vox2 = parseFloat(x2[1][0]);
            Vo = [[vox1],[vox2]];
            //Vo[0] = x1[1];
            //Vo[1] = x2[1];    
        } catch {
            Vo = [[0],[0]];
        };
        const K = [[parseFloat(-(sp1Value + sp2Value)),parseFloat(sp2Value)],[parseFloat(sp2Value), parseFloat(-(sp3Value + sp2Value))]];
        console.log(sp1Value)
        console.log(sp2Value)
        console.log(K)
        const X = [[(x1[0][0] - eqdis1)*scale_r],
                [(x2[0][0] - eqdis2)*scale_r]];
        
        const M = [[ma1Value],[ma2Value]];
        const F = math.multiply(K,X);
        const A = math.dotDivide(F,M);
        console.log(Vo);
        console.log(math.multiply(dt,A));
        const V = math.add(Vo,math.dotMultiply(dt,A)); 
        const test=V;
        console.log(test);
        x1[0][0] += math.multiply(V[0][0],math.divide(dt,scale_r));
        x1[1][0] = V[0][0];
        x2[0][0] += V[1][0]*dt/scale_r;
        x2[1][0] = V[1][0];
        console.log(boxWidth)
        cart1.style.top = '25%';
        cart1.style.left = (boxWidth*x1[0][0]/1000 - 40) + 'px';
        cart2.style.top = '25%';
        cart2.style.left = (boxWidth*x2[0][0]/1000 - 40) + 'px';
        cart3.style.top = '25%';
        cart3.style.left = (boxWidth*x1[0][0]/1000 - 40) + 'px';
        cart4.style.top = '25%';
        cart4.style.left = (boxWidth*x2[0][0]/1000 - 40) + 'px';
        
        spPng11.style.left = "0px";
        spPng11.style.width = (boxWidth*x1[0][0]/1000 - 40) + 'px';
        spPng21.style.left = (boxWidth*x1[0][0]/1000 + 40) + 'px';
        spPng21.style.width = (boxWidth*x2[0][0]/1000 - 40) - (boxWidth*x1[0][0]/1000 + 40) + 'px';
        spPng31.style.left = (boxWidth*x2[0][0]/1000 + 40) + 'px';
        spPng31.style.width = boxWidth - (boxWidth*x2[0][0]/1000 + 40) +'px';
        spPng41.style.left = 0;
        spPng41.style.width = 0;
        spPng51.style.left = 0;
        spPng51.style.width = 0;

        

        if(count>10 & Vo[0][0] < 0 & V[0][0] >0){
            count1Boolean = true;
        } else if(count>10 & Vo[0][0] > 0 & V[0][0] < 0){
            count1Boolean = true;
        } else{
            count1Boolean = false;
        };
        if(count>10 & Vo[1][0] < 0 & V[1][0] >0){
            count2Boolean = true;
        } else if(count>10 & Vo[1][0] > 0 & V[1][0] < 0){
            count2Boolean = true;
        } else{
            count2Boolean = false;
        };
        if(count1Boolean){
            count1 += 1
            cart1Count.style.left = '25%';
            cart1Count.innerText = Math.floor(count1/2);
            frq1.style.left = '25%';
            frq1.style.bottom = '0%';
            frq1.innerText = (2*Math.PI*((count1/2)/simTime)).toFixed(3); 
        };
        if(count2Boolean){
            count2 += 1
            cart2Count.style.left = '40%';
            cart2Count.innerText = Math.floor(count2/2);
            frq2.style.left = '40%';
            frq2.style.bottom = '0%';
            frq2.innerText = (2*Math.PI*((count2/2)/simTime)).toFixed(3); 
        };
        cart1Title.innerText = 'Cart 1';
        cart2Title.innerText = 'Cart 2';
        
    }

    if(numCartsValue == '3'){
        console.log("3");
        const scale_w = rwpValue - lwpValue;
        const scale_r = scale_w/1000; //screen width
        const eqdis1 = 1*(1000/(parseFloat(numCartsValue) + 1));
        const eqdis2 = 2*(1000/(parseFloat(numCartsValue) + 1));
        const eqdis3 = 3*(1000/(parseFloat(numCartsValue) + 1));
        console.log(scale_r);
        console.log(eqdis1);
        console.log(eqdis2);
        console.log(in1Value);
        console.log(count);
        if(dt>0.01){
            dt = 0.01
        };
        if(count < 10){
            console.log('true');
            console.log();
            x1 = [[eqdis1 + in1Value/scale_r],[0]];
            x2 = [[eqdis2 + in2Value/scale_r],[0]];
            x3 = [[eqdis3 + in3Value/scale_r],[0]];
            dt = 0;
            simTime = 0;
            if(count>8){
                count1 = 0;
                count2 = 0;
                count3 = 0;
                count4 = 0;
                cart1Count.innerText = ''
                cart2Count.innerText = ''
                cart3Count.innerText = ''
                cart4Count.innerText = ''
                frq1.innerText = '';
                frq2.innerText = '';
                frq3.innerText = '';
                frq4.innerText = '';  
            }
            //x1[0] = ;
            //x2[0] = ;
        };
        console.log(x1[0][0]);
        console.log(x2[0][0])
        try {
            let vox1 = parseFloat(x1[1][0]);
            let vox2 = parseFloat(x2[1][0]);
            let vox3 = parseFloat(x3[1][0]);
            Vo = [[vox1],[vox2],[vox3]];
            //Vo[0] = x1[1];
            //Vo[1] = x2[1];    
        } catch {
            Vo = [[0],[0],[0]];
        };
        const K = [[parseFloat(-(sp1Value + sp2Value)),parseFloat(sp2Value),0],
                [parseFloat(sp2Value), parseFloat(-(sp3Value + sp2Value)), parseFloat(sp3Value)],
                [0,parseFloat(sp3Value),parseFloat(-(sp3Value + sp4Value))]];
        
        const X = [[(x1[0][0] - eqdis1)*scale_r],[(x2[0][0] - eqdis2)*scale_r],[(x3[0][0] - eqdis3)*scale_r]];
        
        const M = [[ma1Value],[ma2Value],[ma3Value]];
        const F = math.multiply(K,X);
        const A = math.dotDivide(F,M);
        console.log(Vo);
        console.log(math.multiply(dt,A));
        const V = math.add(Vo,math.dotMultiply(dt,A)); 
        const test=V;
        console.log(test);
        x1[0][0] += math.multiply(V[0][0],math.divide(dt,scale_r));
        x1[1][0] = V[0][0];
        x2[0][0] += V[1][0]*dt/scale_r;
        x2[1][0] = V[1][0];
        x3[0][0] += V[2][0]*dt/scale_r;
        x3[1][0] = V[2][0];
        
        cart1.style.top = '25%';
        cart1.style.left = (boxWidth*x1[0][0]/1000 - 40) + 'px';
        cart2.style.top = '25%';
        cart2.style.left = (boxWidth*x2[0][0]/1000 - 40) + 'px';
        cart3.style.top = '25%';
        cart3.style.left = (boxWidth*x3[0][0]/1000 - 40) + 'px';
        cart4.style.top = '25%';
        cart4.style.left = (boxWidth*x3[0][0]/1000 - 40) + 'px';
        
        spPng11.style.left = "0px";
        spPng11.style.width = (boxWidth*x1[0][0]/1000 - 40) + 'px';
        spPng21.style.left = (boxWidth*x1[0][0]/1000 + 40) + 'px';
        spPng21.style.width = (boxWidth*x2[0][0]/1000 - 40) - (boxWidth*x1[0][0]/1000 + 40) + 'px';
        spPng31.style.left = (boxWidth*x2[0][0]/1000 + 40) + 'px';
        spPng31.style.width = (boxWidth*x3[0][0]/1000 - 40) - (boxWidth*x2[0][0]/1000 + 40) +'px';
        spPng41.style.left = (boxWidth*x3[0][0]/1000 + 40) + 'px';
        spPng41.style.width = boxWidth - (boxWidth*x3[0][0]/1000 + 40) + 'px';
        spPng51.style.left = 0;
        spPng51.style.width = 0;

        if(count>10 & Vo[0][0] < 0 & V[0][0] >0){
            count1Boolean = true;
        } else if(count>10 & Vo[0][0] > 0 & V[0][0] < 0){
            count1Boolean = true;
        } else{
            count1Boolean = false;
        };
        if(count1Boolean){
            count1 += 1
            cart1Count.style.left = '25%';
            cart1Count.innerText = Math.floor(count1/2);
            frq1.style.left = '25%';
            frq1.style.bottom = '0%';
            frq1.innerText = (2*Math.PI*((count1/2)/simTime)).toFixed(3); 
        };
        if(count>10 & Vo[1][0] < 0 & V[1][0] >0){
            count2Boolean = true;
        } else if(count>10 & Vo[1][0] > 0 & V[1][0] < 0){
            count2Boolean = true;
        } else{
            count2Boolean = false;
        };
        if(count2Boolean){
            count2 += 1
            cart2Count.style.left = '40%';
            cart2Count.innerText = Math.floor(count2/2);
            frq2.style.left = '40%';
            frq2.style.bottom = '0%';
            frq2.innerText = (2*Math.PI*((count2/2)/simTime)).toFixed(3); 
        };
        if(count>10 & Vo[2][0] < 0 & V[2][0] >0){
            count3Boolean = true;
        } else if(count>10 & Vo[2][0] > 0 & V[2][0] < 0){
            count3Boolean = true;
        } else{
            count3Boolean = false;
        };
        if(count3Boolean){
            count3 += 1
            cart3Count.style.left = '55%';
            cart3Count.innerText = Math.floor(count3/2);
            frq3.style.left = '55%';
            frq3.style.bottom = '0%';
            frq3.innerText = (2*Math.PI*((count3/2)/simTime)).toFixed(3); 
        };
        cart1Title.innerText = 'Cart 1';
        cart2Title.innerText = 'Cart 2';
        cart3Title.innerText = 'Cart 3';
        
    }

    if(numCartsValue == '4'){
        console.log("4");
        const scale_w = rwpValue - lwpValue;
        const scale_r = scale_w/1000; //screen width
        const eqdis1 = 1*(1000/(parseFloat(numCartsValue) + 1));
        const eqdis2 = 2*(1000/(parseFloat(numCartsValue) + 1));
        const eqdis3 = 3*(1000/(parseFloat(numCartsValue) + 1));
        const eqdis4 = 4*(1000/(parseFloat(numCartsValue) + 1));
        console.log(scale_r);
        console.log(eqdis1);
        console.log(eqdis2);
        console.log(in1Value);
        console.log(count);
        if(dt>0.01){
            dt = 0.01
        };
        if(count < 10){
            console.log('true');
            console.log();
            x1 = [[eqdis1 + in1Value/scale_r],[0]];
            x2 = [[eqdis2 + in2Value/scale_r],[0]];
            x3 = [[eqdis3 + in3Value/scale_r],[0]];
            x4 = [[eqdis4 + in4Value/scale_r],[0]];
            dt = 0;
            simTime = 0;
            if(count>8){
                count1 = 0;
                count2 = 0;
                count3 = 0;
                count4 = 0;
                cart1Count.innerText = ''
                cart2Count.innerText = ''
                cart3Count.innerText = ''
                cart4Count.innerText = ''
                frq1.innerText = '';
                frq2.innerText = '';
                frq3.innerText = '';
                frq4.innerText = '';  
            }
            
            //x1[0] = ;
            //x2[0] = ;
        };
        console.log(x1[0][0]);
        console.log(x2[0][0]);
        try {
            let vox1 = parseFloat(x1[1][0]);
            let vox2 = parseFloat(x2[1][0]);
            let vox3 = parseFloat(x3[1][0]);
            let vox4 = parseFloat(x4[1][0]);
            Vo = [[vox1],[vox2],[vox3],[vox4]];
            //Vo[0] = x1[1];
            //Vo[1] = x2[1];    
        } catch {
            Vo = [[0],[0],[0],[0]];
        };
        const K = [[parseFloat(-(sp1Value + sp2Value)),parseFloat(sp2Value),0,0],
            [parseFloat(sp2Value), parseFloat(-(sp3Value + sp2Value)), parseFloat(sp3Value),0],
            [0,parseFloat(sp3Value),parseFloat(-(sp3Value + sp4Value)),parseFloat(sp4Value)],
            [0,0,parseFloat(sp4Value),parseFloat(-(sp4Value + sp5Value))]];
        
        const X = [[(x1[0][0] - eqdis1)*scale_r],
            [(x2[0][0] - eqdis2)*scale_r],
            [(x3[0][0] - eqdis3)*scale_r],
            [(x4[0][0] - eqdis4)*scale_r]];
        
        const M = [[ma1Value],[ma2Value],[ma3Value],[ma4Value]];
        const F = math.multiply(K,X);
        const A = math.dotDivide(F,M);
        console.log(Vo);
        console.log(math.multiply(dt,A));
        const V = math.add(Vo,math.dotMultiply(dt,A)); 
        const test=V;
        console.log(test);
        x1[0][0] += math.multiply(V[0][0],math.divide(dt,scale_r));
        x1[1][0] = V[0][0];
        x2[0][0] += V[1][0]*dt/scale_r;
        x2[1][0] = V[1][0];
        x3[0][0] += V[2][0]*dt/scale_r;
        x3[1][0] = V[2][0];
        x4[0][0] += V[3][0]*dt/scale_r;
        x4[1][0] = V[3][0];
        
        cart1.style.top = '25%';
        cart1.style.left = (boxWidth*x1[0][0]/1000 - 40) + 'px';
        cart2.style.top = '25%';
        cart2.style.left = (boxWidth*x2[0][0]/1000 - 40) + 'px';
        cart3.style.top = '25%';
        cart3.style.left = (boxWidth*x3[0][0]/1000 - 40) + 'px';
        cart4.style.top = '25%';
        cart4.style.left = (boxWidth*x4[0][0]/1000 - 40) + 'px';

        spPng11.style.left = "0px";
        spPng11.style.width = (boxWidth*x1[0][0]/1000 - 40) + 'px';
        spPng21.style.left = (boxWidth*x1[0][0]/1000 + 40) + 'px';
        spPng21.style.width = (boxWidth*x2[0][0]/1000 - 40) - (boxWidth*x1[0][0]/1000 + 40) + 'px';
        spPng31.style.left = (boxWidth*x2[0][0]/1000 + 40) + 'px';
        spPng31.style.width = (boxWidth*x3[0][0]/1000 - 40) - (boxWidth*x2[0][0]/1000 + 40) +'px';
        spPng41.style.left = (boxWidth*x3[0][0]/1000 + 40) + 'px';
        spPng41.style.width = (boxWidth*x4[0][0]/1000 - 40) - (boxWidth*x3[0][0]/1000 + 40) + 'px';
        spPng51.style.left = (boxWidth*x4[0][0]/1000 + 40) + 'px';
        spPng51.style.width = boxWidth - (boxWidth*x4[0][0]/1000 + 40) + 'px';

        if(count>10 & Vo[0][0] < 0 & V[0][0] >0){
            count1Boolean = true;
        } else if(count>10 & Vo[0][0] > 0 & V[0][0] < 0){
            count1Boolean = true;
        } else{
            count1Boolean = false;
        };
        if(count1Boolean){
            count1 += 1
            cart1Count.style.left = '25%';
            cart1Count.innerText = Math.floor(count1/2);
            frq1.style.left = '25%';
            frq1.style.bottom = '0%';
            frq1.innerText = (2*Math.PI*((count1/2)/simTime)).toFixed(3); 
        };
        if(count>10 & Vo[1][0] < 0 & V[1][0] >0){
            count2Boolean = true;
        } else if(count>10 & Vo[1][0] > 0 & V[1][0] < 0){
            count2Boolean = true;
        } else{
            count2Boolean = false;
        };
        if(count2Boolean){
            count2 += 1
            cart2Count.style.left = '40%';
            cart2Count.innerText = Math.floor(count2/2);
            frq2.style.left = '40%';
            frq2.style.bottom = '0%';
            frq2.innerText = (2*Math.PI*((count2/2)/simTime)).toFixed(3); 
        };
        if(count>10 & Vo[2][0] < 0 & V[2][0] >0){
            count3Boolean = true;
        } else if(count>10 & Vo[2][0] > 0 & V[2][0] < 0){
            count3Boolean = true;
        } else{
            count3Boolean = false;
        };
        if(count3Boolean){
            count3 += 1
            cart3Count.style.left = '55%';
            cart3Count.innerText = Math.floor(count3/2);
            frq3.style.left = '55%';
            frq3.style.bottom = '0%';
            frq3.innerText = (2*Math.PI*((count3/2)/simTime)).toFixed(3); 
        };
        if(count>10 & Vo[3][0] < 0 & V[3][0] >0){
            count4Boolean = true;
        } else if(count>10 & Vo[3][0] > 0 & V[3][0] < 0){
            count4Boolean = true;
        } else{
            count4Boolean = false;
        };
        if(count4Boolean){
            count4 += 1
            cart4Count.style.left = '70%';
            cart4Count.innerText = Math.floor(count4/2);
            frq4.style.left = '70%';
            frq4.style.bottom = '0%';
            frq4.innerText = (2*Math.PI*((count4/2)/simTime)).toFixed(3); 
        };
        cart1Title.innerText = 'Cart 1';
        cart2Title.innerText = 'Cart 2';
        cart3Title.innerText = 'Cart 3';
        cart4Title.innerText = 'Cart 4';
        
    }

    
    simTime += dt;
    simClock.innerText = simTime.toFixed(2) + ' s';

    count += 1;
    
}

