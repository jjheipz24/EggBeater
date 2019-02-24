 "use strict";

 window.onload = init;

 // SCRIPT SCOPED VARIABLES

 // 1- here we are faking an enumeration - we'll look at another way to do this soon
 const SOUND_PATH = Object.freeze({
     sound1: "testAudio/bornThisWay.mp3",
     sound2: "testAudio/chickenSong.mp3",
     sound3: "testAudio/sicEmOnAChicken.mp3",
     sound4: "testAudio/chickenFried.mp3"
 });

 //Canvas variables
 let canvasElement, drawCtx;
 //Audio variables
 let audioElement, audioCtx;
 //node variables
 let sourceNode, analyserNode, gainNode;
 //array to hold audio frequency data
 const NUM_SAMPLES = 256;
 //array of 8-bit int (0-255)
 let audioData = new Uint8Array(NUM_SAMPLES / 2);
 //UI variables
 let playButton;

 //these help with pixel effects
 let invert = false,
     noise = false,
     sepia = false;

 //delay variables
 let delayAmount = 0;
 let delayNode;

 //distortion variable
 let distortionFilter;
 let distortionAmount = 0;

 //fill effects
 let gay, les, bi, pan, ace;

 let gayOn = false;
 let fenceOn = true;

 let rooster = new Image();
 rooster.src = 'images/martha.png';

 // FUNCTIONS
 function init() {
     setupWebaudio();
     setupCanvas();
     setupUI();
     update();

 }

 function setupWebaudio() {
     // 1 - The || is because WebAudio has not been standardized across browsers yet
     const AudioContext = window.AudioContext || window.webkitAudioContext;
     audioCtx = new AudioContext();

     // 2 - get a reference to the <audio> element on the page
     audioElement = document.querySelector("audio");
     audioElement.src = SOUND_PATH.sound2;

     // 3 - create an a source node that points at the <audio> element
     sourceNode = audioCtx.createMediaElementSource(audioElement);

     // 4 - create an analyser node
     analyserNode = audioCtx.createAnalyser();


     // fft stands for Fast Fourier Transform
     analyserNode.fftSize = NUM_SAMPLES;

     // 5 - create a gain (volume) node
     gainNode = audioCtx.createGain();
     gainNode.gain.value = 1;

     //create DelayNode instance
     delayNode = audioCtx.createDelay();
     delayNode.delayTime.value = delayAmount;

     //create waveshaper/distortion node
     distortionFilter = audioCtx.createWaveShaper();


     //			// 6 - connect the nodes - we now have an audio graph
     //			sourceNode.connect(analyserNode);
     //          analyserNode.connect(gainNode);
     //          gainNode.connect(audioCtx.destination);
     sourceNode.connect(audioCtx.destination);
     //this channel will play and visualize the delay
     sourceNode.connect(delayNode);
     delayNode.connect(analyserNode);
     analyserNode.connect(distortionFilter);
     distortionFilter.connect(gainNode);
     gainNode.connect(audioCtx.destination);

 }

 function setupCanvas() {
     canvasElement = document.querySelector('canvas');
     drawCtx = canvasElement.getContext("2d");
 }

 function setupUI() {
     /*
     3 sliders: Volume, Reverb, Brightness
     3 checkboxes: invert, sepia, noise
     radio: different pride flags
     Button: make it gay
     */

     //PLAY BUTTON
     playButton = document.querySelector("#playButton");
     playButton.onclick = e => {
         console.log(`audioCtx.state = ${audioCtx.state}`);

         // check if context is in suspended state (autoplay policy)
         if (audioCtx.state == "suspended") {
             audioCtx.resume();
         }

         if (e.target.dataset.playing == "no") {
             audioElement.play();
             e.target.dataset.playing = "yes";
             // if track is playing pause it
         } else if (e.target.dataset.playing == "yes") {
             audioElement.pause();
             e.target.dataset.playing = "no";
         }

     };

     //FULL SCREEN BUTTON
     document.querySelector("#fsButton").onclick = _ => {
         requestFullscreen(canvasElement);
     };

     //AUDIO TRACK SELECTOR
     document.querySelector("#trackSelect").onchange = e => {
         audioElement.src = e.target.value;
         // pause the current track if it is playing
         playButton.dispatchEvent(new MouseEvent("click"));
     };

     //Make it gay button click event
     document.querySelector("#makeGay").onclick = _ => {
         let trackSelect = document.querySelector("#trackSelect");
         audioElement.src = "testAudio/bornThisWay.mp3";
         trackSelect.value = "testAudio/bornThisWay.mp3";

         //turns bars and fence on/off
         gayOn = !gayOn;
         fenceOn = !fenceOn;
         // pause the current track if it is playing
         playButton.dispatchEvent(new MouseEvent("click"));
         document.querySelector("#gay").checked = true;
     };

     // if track ends
     audioElement.onended = _ => {
         playButton.dataset.playing = "no";
     };

     //VOLUME SLIDER
     let volumeSlider = document.querySelector("#volumeSlider");
     volumeSlider.oninput = e => {
         gainNode.gain.value = e.target.value;
         volumeLabel.innerHTML = Math.floor((e.target.value / 2 * 100));
         console.log(gainNode.gain.value);
     };
     volumeSlider.dispatchEvent(new InputEvent("input"));

     //DELAY SLIDER
     let delaySlider = document.querySelector("#delaySlider");
     //console.log(delaySlider);
     delaySlider.oninput = e => {
         delayAmount = e.target.value;
         delayLabel.innerHTML = e.target.value;
     }


     //DISTORTION SLIDER
     let distortionSlider = document.querySelector("#distortSlider");
     distortionSlider.value = distortionAmount;

     distortionSlider.oninput = e => {
         distortionAmount = e.target.value;
         distortLabel.innerHTML = e.target.value;
         distortionFilter.curve = null;
         distortionFilter.curve = makeDistortionCurve(distortionAmount);
     };


     function makeDistortionCurve(amount = 20) {
         let n_samples = 256,
             curve = new Float32Array(n_samples);
         for (let i = 0; i < n_samples; ++i) {
             let x = i * 2 / n_samples - 1;
             curve[i] = (Math.PI + amount) * x / (Math.PI + amount * Math.abs(x));
         }
         return curve;
     }


     //CHECKBOX ACTIVATION
     document.getElementById('invert').onchange = function (e) {
         if (e.target.checked) {
             invert = true;
         } else {
             invert = false;
         }
     }
     document.getElementById('noise').onchange = function (e) {
         if (e.target.checked) {
             noise = true;
         } else {
             noise = false;
         }
     }
     document.getElementById('sepia').onchange = function (e) {
         if (e.target.checked) {
             sepia = true;
         } else {
             sepia = false;
         }
     }


 }

 function update() {
     // this schedules a call to the update() method in 1/60 seconds
     requestAnimationFrame(update);

     // populate the audioData with the frequency data
     // notice these arrays are passed "by reference"
     analyserNode.getByteFrequencyData(audioData);

     // DRAW!
     drawCtx.clearRect(0, 0, 800, 600);



     let barWidth = 4;
     let barSpacing = 1;
     let barHeight = 100;
     let topSpacing = 525;

     //RADIO BUTTONS
     gay = document.getElementById('gay');
     les = document.getElementById('les');
     bi = document.getElementById('bi');
     pan = document.getElementById('pan');
     ace = document.getElementById('ace');

     //turns the fence on and off
     for (let i = 0; i < audioData.length; i++) {
         if (fenceOn) {
             makeFence(i);
         } else {
             fenceOn = false;
         }
     }

     drawCtx.drawImage(rooster, canvasElement.width - 150, canvasElement.height - 150, 150, 150);


     for (let i = 0; i < audioData.length; i++) {

         drawGrass(i, 0);
         drawGrass(i, 5);
         drawGrass(i, -5);

         //Eggs
         if (gay.checked) {
             changeEggColor(gay, i, barHeight, barSpacing, topSpacing);
         } else if (les.checked) {
             changeEggColor(les, i, barHeight, barSpacing, topSpacing);
         } else if (bi.checked) {
             changeEggColor(bi, i, barHeight, barSpacing, topSpacing);
         } else if (pan.checked) {
             changeEggColor(pan, i, barHeight, barSpacing, topSpacing);
         } else if (ace.checked) {
             changeEggColor(ace, i, barHeight, barSpacing, topSpacing);
         } else {
             //default eggs
             drawCtx.beginPath();
             drawCtx.save();
             drawCtx.fillStyle = 'rgb(234, 225, 190)';
             drawCtx.scale(.75, 1);
             drawCtx.arc(750 - i * (barHeight + barSpacing), topSpacing - audioData[i] * 0.5, barHeight - 75, 0, 2 * Math.PI, false);
             drawCtx.fill();
             drawCtx.stroke();
             drawCtx.closePath();
             drawCtx.restore();
         }

         //Sun lines
         for (var j = 0; j < 8; j++) {
             drawCtx.save();
             drawCtx.translate(680, 60);
             drawCtx.rotate((j / 8) * 3 * Math.PI);
             drawCtx.translate(-60, j * 7);
             drawCtx.strokeStyle = "#f2d03c"
             drawCtx.lineWidth = 3;
             drawCtx.beginPath();
             drawCtx.moveTo(0, audioData[i] * 0.2);
             drawCtx.lineTo(audioData[i] * 0.1, 2);
             drawCtx.closePath();
             drawCtx.stroke();
             drawCtx.fill();
             drawCtx.restore();
         }

         if (gayOn) {
             drawRainbowBars(i, barWidth, barSpacing, barHeight);

         } else {
             gayOn = false;
         }

     }


     //Sun (circle part)
     drawCtx.beginPath();
     drawCtx.fillStyle = "#f2d03c"
     drawCtx.arc(680, 65, 50, 0, 2 * Math.PI, false);
     drawCtx.fill();
     drawCtx.closePath();


     manipulatePixels(drawCtx);
     delayNode.delayTime.value = delayAmount;

 }





 // HELPER FUNCTIONS
 function requestFullscreen(element) {
     if (element.requestFullscreen) {
         element.requestFullscreen();
     } else if (element.mozRequestFullscreen) {
         element.mozRequestFullscreen();
     } else if (element.mozRequestFullScreen) { // camel-cased 'S' was changed to 's' in spec
         element.mozRequestFullScreen();
     } else if (element.webkitRequestFullscreen) {
         element.webkitRequestFullscreen();
     }
     // .. and do nothing if the method is not supported
 };

 function manipulatePixels(ctx) {
     //get all rgba pixel data of the canvas by grabbing the ImageData Object
     let imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

     //imageData.data is an 8-bit typed array - values range from 0-255
     //imageData.data contains 4 values per pixel: 4 x canvas.width x canvas.height = 1,024,00 values
     let data = imageData.data;
     let length = data.length;
     let width = imageData.width;

     for (let i = 0; i < length; i += 4) {
         //invert
         if (invert) {
             let red = data[i],
                 green = data[i + 1],
                 blue = data[i + 2];
             data[i] = 255 - red; //set red value
             data[i + 1] = 255 - green; //set blue;
             data[i + 2] = 255 - blue; //set green
         }

         //noise
         if (noise && Math.random() < .10) {
             data[i] = data[i + 1] = data[i + 2] = 128; //gray noise
             //data[i] = data[i + 1] = data [i+2] = 255; //white
             //data[i] = data[i + 1] = data [i+2] = 0; //black
             data[i + 3] = 255; //alpha

         }

         //sepia
         if (sepia) {
             data[i] = (data[i] * .393) + (data[i + 1] * .769) + (data[i + 2] * .189);
             data[i + 1] = (data[i] * .349) + (data[i + 1] * .686) + (data[i + 2] * .168);
             data[i + 2] = (data[i] * .272) + (data[i + 1] * .534) + (data[i + 2] * .131);
         }
     }
     //put motified data back on the canvas
     ctx.putImageData(imageData, 0, 0);
 }
 //LGBTQ+ gradients
 function changeEggColor(flag, i, barHeight, barSpacing, topSpacing) {
     let grad = drawCtx.createLinearGradient(0, 0, 800, 0);
     switch (flag) {
         case gay:
             drawCtx.beginPath();
             drawCtx.save();
             grad.addColorStop(0, 'red');
             grad.addColorStop(1 / 6, 'orange');
             grad.addColorStop(2 / 6, 'yellow');
             grad.addColorStop(3 / 6, 'green');
             grad.addColorStop(4 / 6, 'aqua');
             grad.addColorStop(5 / 6, 'blue');
             grad.addColorStop(1, 'purple');
             drawCtx.fillStyle = grad;
             drawEggs(i, barHeight, barSpacing, topSpacing);
             drawCtx.fill();
             drawCtx.stroke();
             drawCtx.closePath();
             drawCtx.restore();

             break;
         case les:
             drawCtx.beginPath();
             drawCtx.save();
             grad.addColorStop(0, '#a40061');
             grad.addColorStop(1 / 6, '#b75592');
             grad.addColorStop(2 / 6, '#d063a6');
             grad.addColorStop(3 / 6, 'white');
             grad.addColorStop(4 / 6, '#e4accf');
             grad.addColorStop(5 / 6, '#c54e54');
             grad.addColorStop(1, '#8a1e04');
             drawCtx.fillStyle = grad;
             drawEggs(i, barHeight, barSpacing, topSpacing);
             drawCtx.fill();
             drawCtx.stroke();
             drawCtx.closePath();
             drawCtx.restore();

             break;
         case bi:
             drawCtx.beginPath();
             drawCtx.save();
             grad.addColorStop(0, '#ec1c89');
             grad.addColorStop(1 / 2, '#9e49c2');
             grad.addColorStop(1, '#3f48cc');
             drawCtx.fillStyle = grad;
             drawEggs(i, barHeight, barSpacing, topSpacing);
             drawCtx.fill();
             drawCtx.stroke();
             drawCtx.closePath();
             drawCtx.restore();

             break;
         case pan:
             drawCtx.beginPath();
             drawCtx.save();
             grad.addColorStop(0, '#fc2fe1');
             grad.addColorStop(1 / 7, '#fc2fe1');
             grad.addColorStop(2 / 7, '#e0ef0b');
             grad.addColorStop(3 / 7, '#e0ef0b');
             grad.addColorStop(4 / 7, '#e0ef0b');
             grad.addColorStop(5 / 7, '#e0ef0b');
             grad.addColorStop(6 / 7, '#2eadfc');
             grad.addColorStop(1, '#2eadfc');
             drawCtx.fillStyle = grad;
             drawEggs(i, barHeight, barSpacing, topSpacing);
             drawCtx.fill();
             drawCtx.stroke();
             drawCtx.closePath();
             drawCtx.restore();

             break;
         case ace:
             drawCtx.beginPath();
             drawCtx.save();
             grad.addColorStop(0, 'black');
             grad.addColorStop(1 / 3, '#a3a3a3');
             grad.addColorStop(2 / 3, 'white');
             grad.addColorStop(1, '#800080');
             drawCtx.fillStyle = grad;
             drawEggs(i, barHeight, barSpacing, topSpacing);
             drawCtx.fill();
             drawCtx.stroke();
             drawCtx.closePath();
             drawCtx.restore();

             break;
         default:
             drawCtx.beginPath();
             drawCtx.save();
             drawCtx.fillStyle = 'rgb(234, 225, 190)';
             drawEggs(i, barHeight, barSpacing, topSpacing);
             drawCtx.fill();
             drawCtx.stroke();
             drawCtx.closePath();
             drawCtx.restore();
     }
 }

 //draws the eggs
 function drawEggs(i, barHeight, barSpacing, topSpacing) {
     drawCtx.scale(.75, 1);
     drawCtx.arc(750 - i * (barHeight + barSpacing), topSpacing - audioData[i] * 0.5, barHeight - 75, 0, 2 * Math.PI, false);
 }

 //draws the grass
 function drawGrass(i, offset) {
     //grass
     drawCtx.save();
     drawCtx.beginPath();
     drawCtx.strokeStyle = "green";
     drawCtx.moveTo((i * 6), 550 + offset);
     drawCtx.bezierCurveTo(i * 6, 550 + offset, (i * 6 + 25 + offset), 530 + offset, (i * 6 + 27 + offset), (audioData[i] * .4) + 520 + offset);
     drawCtx.stroke();
     drawCtx.closePath();
     drawCtx.restore();
 }

 //rainbow bars when make it gay button is pressed
 function drawRainbowBars(i, barWidth, barSpacing, barHeight) {
     let rainbowGrad = drawCtx.createLinearGradient(0, 0, 800, 0);
     drawCtx.save();
     rainbowGrad.addColorStop(0, 'red');
     rainbowGrad.addColorStop(1 / 6, 'orange');
     rainbowGrad.addColorStop(2 / 6, 'yellow');
     rainbowGrad.addColorStop(3 / 6, 'green');
     rainbowGrad.addColorStop(4 / 6, 'aqua');
     rainbowGrad.addColorStop(5 / 6, 'blue');
     rainbowGrad.addColorStop(1, 'purple');

     drawCtx.fillStyle = rainbowGrad;
     drawCtx.fillRect(i * (barWidth + barSpacing) * 4, 0, barWidth * 4, audioData[i]);
     drawCtx.fill();
     drawCtx.restore();
 }

 function makeFence(i) {
     //fence
     drawCtx.save();
     drawCtx.beginPath();
     for (let i = 0; i < 35; i++) {
         drawCtx.rect(26 * i, (350 - audioData[i] * 0.5), 25, 500);
     }
     drawCtx.fillStyle = "white";
     drawCtx.strokeStyle = "black";
     drawCtx.stroke();
     drawCtx.fill();
     drawCtx.closePath();
     drawCtx.restore();

     //top of fence
     drawCtx.save();
     drawCtx.beginPath();
     for (let i = 0; i < 35; i++) {
         drawCtx.moveTo(26 * i, (350 - audioData[i] * 0.5));
         drawCtx.lineTo((26 * i) + 10, (350 - audioData[i] * 0.5) - 20);
         drawCtx.lineTo((26 * i) + 26, (350 - audioData[i] * 0.5))
     }
     drawCtx.fillStyle = "white";
     drawCtx.strokeStyle = "black";
     drawCtx.stroke();
     drawCtx.fill();
     drawCtx.closePath();
     drawCtx.restore();
 }
