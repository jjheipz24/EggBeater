var app = app || {};

app.graphics = (function () {

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
                makeFence(i / 2);
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
            /*for (var j = 0; j < 8; j++) {
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
            } */

            //sun lines by ella
            //for (var j = 0; j < 6; j++) {
            drawCtx.save();
            let currentLoc = audioData[i] * 0.2;
            drawCtx.translate(680, 60);
            drawCtx.rotate((currentLoc) * Math.PI);
            drawCtx.translate(-60, 5);
            drawCtx.strokeStyle = "#f2d03c"
            drawCtx.lineWidth = 3;
            drawCtx.beginPath();
            drawCtx.moveTo(0, 0);
            drawCtx.lineTo(-currentLoc, -currentLoc / 4);
            drawCtx.closePath();
            drawCtx.stroke();
            drawCtx.fill();
            drawCtx.restore();
            //}



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
    return {
        update
    };
})();
