
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var particles = [];
var particlesMin = 0;
var loop = setInterval(function(){mainLoop();}, 20);
var spacePressed = false; //Would be logical to use an array if I had more than just one key
var mouse = {
    x : 0,
    y : 0,
};
function start(){ //Runs when you press the button
    document.body.insertBefore(canvas, document.body.childNodes[0]); //Creates canvas
    canvas.style.backgroundColor = "lightblue"; 
    canvas.width = 900; //Canvas styling things
    canvas.height = 450;
    canvas.addEventListener("click", function (event) { //When click, do shatter
        shatter(mouse);
    }, false);
    document.addEventListener("mousemove", function(event){ //Whenever mouse moves, update it's position. Otherwise it's not moving and position doesn't change
        var canvasPlace = canvas.getBoundingClientRect();
        mouse = {
            x : (event.clientX - canvasPlace.left),
            y : (event.clientY - canvasPlace.top)
        }
    }, false);
    document.addEventListener("keydown", function(event){ //Not optimized for multiple keys
        if(event.keyCode == 32){
            event.preventDefault(); //Because highlighty thing is annoying
            shatter(mouse);
        }
    }, false);
    document.getElementById("StuffThatAppears").style.display = "block";
    wipeParameters();
}
function mainLoop(){ //Runs once every interval time
    if(document.getElementById("clearCanvas")){
        ctx.clearRect(0, 0, canvas.width, canvas.height); //Clears previous particles. Don't worry, they're going to be redrawn with updated positions
    }
    var max = particles.length;
    for(i = particlesMin; i < max; i++){ //Updates pos and draws particles every loop
        particles[i].loop();
    }
    autoSummonStuff();
}
function autoSummonStuff(){
    if(document.getElementById("autoSummon").checked){
        console.log("true");
        createParticle();
    }
    if(document.getElementById("autoSummonLine").checked){
        squiggleLine();
    }
}
function updateTickRate(){ //When the update tick rate button is pressed, remove the existing loop and create a new one with the new tick time
    clearInterval(loop);
    loop = setInterval(function(){mainLoop();}, document.getElementById("tickRate").value);
}
function particle(posX, posY, posAngle, aMagX, aMagY, r, g, b, al){
    //posX and posY are arrays of position determining numbers
    //pos[0] = position, pos[1] = velocity, pos[2] = acceleration, etc.
    this.posX = posX;
    this.posY = posY;
    this.posR = posAngle;
    this.aMagX = aMagX;
    this.aMagY = aMagY;
    this.r = r;
    this.g = g;
    this.b = b;
    this.al = al;
    this.truePos = {
        x : this.posX[0] + this.aMagX[0]*Math.cos(this.posR[0]), 
        y : this.posY[0] + this.aMagY[0]*Math.sin(this.posR[0]),
    }
    this.loop = function(){
        this.updatePos();
        this.draw();
    }
    this.updatePos = function(){ //Goes through each element of 5 element arrays and updates them
        this.posX = incrementArrayByNextElement(this.posX);
        this.posY = incrementArrayByNextElement(this.posY);
        this.posR = incrementArrayByNextElement(this.posR);
        this.aMagX = incrementArrayByNextElement(this.aMagX);
        this.aMagY = incrementArrayByNextElement(this.aMagY);
        this.r = incrementArrayByNextElement(this.r);
        this.g = incrementArrayByNextElement(this.g);
        this.b = incrementArrayByNextElement(this.b);
        this.al = incrementArrayByNextElement(this.al);

        if(document.getElementById("colorCycle").checked){ //If color cycle is on, r g and b go back to 0 after 255 and other way around
            this.r[0] = overload(this.r[0], 0, 255);
            this.g[0] = overload(this.g[0], 0, 255);
            this.b[0] = overload(this.b[0], 0, 255);
        }
        if(document.getElementById("alphaCycle").checked){ //same thing but alpha
            this.al[0] = overload(this.al[0], 0, 1);
        }

        this.truePos.x = this.posX[0] + this.aMagX[0]*Math.cos(this.posR[0]); //Update truepos (used for this.draw() and shatter())
        this.truePos.y = this.posY[0] + this.aMagY[0]*Math.sin(this.posR[0]);
    }
    this.draw = function(){
        ctx.fillStyle = "rgba(" + this.r[0] + ", " + this.g[0] + ", " + this.b[0] + ", " + this.al[0] + ")";
        ctx.fillRect(this.truePos.x, this.truePos.y, 1, 1);
    }
}
function incrementArrayByNextElement(array){
    var max = array.length-1;
    for(var i = 0; i < max; i++){
        array[i] += array[i+1];
    }
    return array;
}
function overload(n, min, max){
    if(n > max){
        return (min + (n - max)); //So it goes back to min plus overload amount
    }
    if(n < min){
        return (max - (min - n)); //Goes back to max minus overload amount (well overload amount is negative)
    }
    else{
        return n;
    }
}
function createParticle(){ //Creates new particle with entered parameters
    var xParams = [];
    var yParams = [];
    var aParams = []; //In radians
    var aMagX = [];
    var aMagY = [];
    var r = [];
    var g = [];
    var b = [];
    var al = [];
    for(i = 0; i <= 5; i++){ //1* stuff because js is stupid with variable types
        xParams[i] = 1*document.getElementById("x"+i).value;
        yParams[i] = -1*document.getElementById("y"+i).value; //Negative because we're doing regular coordinate input instead of weird canvas directions
        aParams[i] = 1*document.getElementById("a"+i).value;
        aMagX[i] = 1*document.getElementById("amx"+i).value;
        aMagY[i] = -1*document.getElementById("amy"+i).value; //Negative because flipping y thingy
        r[i] = 1*document.getElementById("r"+i).value;
        g[i] = 1*document.getElementById("g"+i).value;
        b[i] = 1*document.getElementById("b"+i).value;
        al[i] = 1*document.getElementById("al"+i).value;
    }
    xParams[0] += canvas.width/2; //So center of canvas is (0, 0)
    yParams[0] += canvas.height/2; //So center of canvas is (0, 0)
    particles[particles.length] = new particle(xParams, yParams, aParams, aMagX, aMagY, r, g, b, al); //Creates new particle at end of array
}
function shatter(mouse){ //I made it so you pass a coordinate variable to this so that we can shatter in a non-mouse position. Maybe I'll get around to do doing that if I want to
    for(i = particlesMin; i < particles.length; i++){ //Cycles through all existing particles
        var shatterX = particles[i].truePos.x-mouse.x; //Difference in x
        var shatterY = particles[i].truePos.y-mouse.y; //Difference in y
        particles[i].posX[1] += 10*shatterX/(Math.pow(shatterX, 2) + Math.pow(shatterY, 2)); //Weird equation to make the shatter velocity lower the farther away the two objects are
        particles[i].posY[1] += 10*shatterY/(Math.pow(shatterX, 2) + Math.pow(shatterY, 2));

        //Sets (x, y) to include circular position so we can get rid of circular position after the particle gets shattered
        particles[i].posX[0] = particles[i].truePos.x;
        particles[i].posY[0] = particles[i].truePos.y;
        for(h = 0; h <= 5; h++){ //Clears circular position
            particles[i].posR[h] = 0;
            particles[i].aMagX[h] = 0;
            particles[i].aMagY[h] = 0;
        }
    }
}
function wipeParticles(){
    var max = particles.length;
    for(i = particlesMin; i < max; i++){  //Cycles through all existing particles
        particles[i] = 0; //Aaand effectively deletes them
    }
    particlesMin = max; //Sets new min
}
function updateParameters(x, y, a, amx, amy, r, g, b, al, autoSummon){ //Takes in 5 arrays of 6
    for(i = 0; i <= 5; i++){
        document.getElementById("x"+i).value = x[i]; //Then goes through the document values and sets them to the taken in arrays
        document.getElementById("y"+i).value = y[i];
        document.getElementById("a"+i).value = a[i];
        document.getElementById("amx"+i).value = amx[i];
        document.getElementById("amy"+i).value = amy[i];
        document.getElementById("r"+i).value = r[i];
        document.getElementById("g"+i).value = g[i];
        document.getElementById("b"+i).value = b[i];
        document.getElementById("al"+i).value = al[i];
    }
    document.getElementById("autoSummon").checked = autoSummon;
}
function wipeParameters(){
    var x = [0, 0, 0, 0, 0, 0];
    var y = [0, 0, 0, 0, 0, 0];
    var a = [0, 0, 0, 0, 0, 0]; //Could be solved with multiple fors, but I like having this template for copy and pasting to new presets
    var amx = [0, 0, 0, 0, 0, 0];
    var amy = [0, 0, 0, 0, 0, 0];
    var r = [0, 0, 0, 0, 0, 0];
    var g = [0, 0, 0, 0, 0, 0];
    var b = [0, 0, 0, 0, 0, 0];
    var al = [1, 0, 0, 0, 0, 0];
    updateParameters(x, y, a, amx, amy, r, g, b, al, false);
    document.getElementById("autoSummonLine").checked = false;
}
function image1Preset(){
    var x = [0, 0, 0, 0, 0, 0];
    var y = [0, 0, 0, 0, 0, 0];
    var a = [0, 0.8, 0, 0, 0, 0];
    var amx = [0, 0.05, 0, 0, 0, 0];
    var amy = [0, 0.05, 0, 0, 0, 0];
    var r = [0, 0, 0, 0, 0, 0];
    var g = [0, 0, 0, 0, 0, 0];
    var b = [0, 0, 0, 0, 0, 0];
    var al = [1, 0, 0, 0, 0, 0];
    updateParameters(x, y, a, amx, amy, r, g, b, al, true);
}
function image2Preset(){
    var x = [0, 0, 0, 0, 0, 0];
    var y = [0, 0, 0, 0, 0, 0];
    var a = [0, 0.1, 0, 0, 0, 0];
    var amx = [100, 0, -0.01, -0.0001, 0.000001, 0];
    var amy = [50, 0, -0.01, 0, 0, 0];
    var r = [0, 0, 0, 0, 0, 0];
    var g = [0, 0, 0, 0, 0, 0];
    var b = [0, 0, 0, 0, 0, 0];
    var al = [1, 0, 0, 0, 0, 0];
    updateParameters(x, y, a, amx, amy, r, g, b, al, true);
}
function image3Preset(){
    var x = [-450, 0.1, 0, 0, 0, 0];
    var y = [225.5, -0.2, 0, 0.0000001, 0, 0];
    var a = [0, 0.8, 0, 0, 0, 0];
    var amx = [0, 0.05, 0, 0, 0, 0];
    var amy = [0, 0.05, 0, 0, 0, 0];
    var r = [0, 0, 0, 0, 0, 0];
    var g = [0, 0, 0, 0, 0, 0];
    var b = [0, 0, 0, 0, 0, 0];
    var al = [1, 0, 0, 0, 0, 0];
    updateParameters(x, y, a, amx, amy, r, g, b, al, true);
}
function squiggleLine(){
    for(i = 0; i < 100; i++){ //Summons a ton of particles at once
        var xParams = [i, 0, 0, 0.0002];
        var yParams = [1, 0, 0, 0.0001];
        var aParams = [0, Math.PI/10]; //In radians
        var aMagX = [5];
        var aMagY = [5];
        var r = [];
        var g = [];
        var b = [];
        var al = [];
        for(h = 0; h <= 5; h++){
            r[h] = 1*document.getElementById("r"+h).value;
            g[h] = 1*document.getElementById("g"+h).value;
            b[h] = 1*document.getElementById("b"+h).value;
            al[h] = 1*document.getElementById("al"+h).value;
        }
        particles[particles.length] = new particle(xParams, yParams, aParams, aMagX, aMagY, r, g, b, al);
    }
}