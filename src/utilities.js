var app = app || {};

app.utilities = (function () {
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
    return {
        requestFullscreen,
        manipulatePixels,
        changeEggColor,
        drawEggs,
        drawGrass,
        drawRainbowBars,
        makeFence
    };
})();
