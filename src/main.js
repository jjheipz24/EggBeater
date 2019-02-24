var app = app || {};

app.main = (function () {
    "use strict";

    // SCRIPT SCOPED VARIABLES

    // 1- here we are faking an enumeration - we'll look at another way to do this soon
    const SOUND_PATH = Object.freeze({
        sound1: "../testAudio/bornThisWay.mp3",
        sound2: "../testAudio/chickenSong.mp3",
        sound3: "../testAudio/sicEmOnAChicken.mp3",
        sound4: "../testAudio/chickenFried.mp3"
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

    //turns gay bars and fence on or off
    let gayOn = false;
    let fenceOn = true;

    let rooster = new Image();
    rooster.src = '../images/martha.png';

    // FUNCTIONS
    function init() {
        setupWebaudio();
        setupCanvas();
        setupUI();
        //update();

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
            app.utilities.requestFullscreen(canvasElement);
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
            audioElement.src = "../testAudio/bornThisWay.mp3";
            trackSelect.value = "../testAudio/bornThisWay.mp3";

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

    return {
        init
    };
})();
