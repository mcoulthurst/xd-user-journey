'use strict';
const { Line, Rectangle, Ellipse, Text, Color } = require("scenegraph");
const CSV = require("./csv");
const fs = require("uxp").storage.localFileSystem;
const textFill = ["grey-3", '#dee0e2'];
const textFillDark = ["grey-1", '#6f777b'];
const trafficLights = [
    ["green", '#006435'],
    ["green (button)", '#00823b'],
    ["light-green", '#85994b'],
    ["yellow", '#ffbf47'],
    ["orange", '#f47738'],
    ["bright-red", '#df3034'],
    ["red", '#b10e1e']
];
const rowColor = [
    ["light-blue", '#2b8cc4'],
    ["green (button)", '#00823b'],
    ["bright-purple", '#912b88'],
    ["light-purple", '#6f72af'],
    ["orange", '#f47738'],
    ["bright-red", '#df3034']
];

const palette = [
    ["Midnight Blue", '#2c3e50'],
    ["Belize Hole", '#2980b9'],
    ["Wisteria", '#8e44ad'],
    ["Pumpkin", '#d35400'],
    ["Pomegranate", '#c0391b'],
    ["Nephritis", '#27ae60'],
    ["Peter River", '#3498db'],
    ["Emerald", '#2ecc71']
];

const ht = 100;
const wd = 160;
const gutterX = 5;
const gutterY = 32;
var fontSize = 12;
var fontHeaderSize = 18;
var fontLargeSize = 48;
var offsetX = 2 * wd + gutterX;
var offsetY = 110;
var assets = require("assets");
var allColors;



function getAssetPalette(){
    allColors = assets.colors.get();
    console.log(allColors);
    if (allColors.length<4){
        addPalette(palette);
    }
    allColors = assets.colors.get();
}

function addPalette(arr) {
    var i = 0;
    var len = arr.length;
    for (i=0; i<len; i++){
        addColor(arr[i])
    }
}


function addColor(array) {
    var assets = require("assets");
    var label = array[0] + ' ('+array[1]+')';
    var color = new Color(array[1]);
    assets.colors.add([
        { name: label, color: color }
    ]);

}

async function insertTextFromFileHandler(selection) {
    var i, j;
    // TODO get existing assets colours and use first four as row fills

    const aFile = await fs.getFileForOpening({ types: ["txt", "csv"] });
    if (!aFile) {
        return;
    }

    const contents = await aFile.read();
    const arr = CSV.parse(contents);
    offsetY = 110;
    getAssetPalette();

    // draw side panel
    drawSidePanel(arr, selection);

    var rows = arr.length;
    var cols;
    var text;
    for (j = 5; j < rows; j++) {
        cols = arr[j].length;
        // process the emotions with emoticons
        if (j === 7) {
            drawEmotions(arr[j], selection);
        }

        // double ht line for journey emotions
        if (j === 8) {
            offsetY = offsetY + ht;
        }

        for (i = 0; i < cols; i++) {
            if (i == 0) {
                // add header
                var str = String(arr[j][i]).toUpperCase();
                text = new Text();
                text.text = str;
                text.styleRanges = [{
                    length: str.length,
                    fill: new Color("black"),
                    fontSize: fontHeaderSize
                }];
                selection.insertionParent.addChild(text);
                text.moveInParentCoordinates(offsetX + (gutterX + (i) * (wd + gutterX)), offsetY - 2 * gutterX + (j - 4) * (ht + gutterY));
            }

            if (arr[j][i] !== null && i > 0 && j !== 7) {
                var str = String(arr[j][i]); // cast to string so we can get length
                text = new Text();
                text.areaBox = { width: wd - gutterX * 3, height: ht };
                text.text = str;
                text.styleRanges = [{
                    length: str.length,
                    fill: new Color(textFill[1]),
                    fontSize: fontSize
                }];

                const rect = new Rectangle();
                rect.width = wd;
                rect.height = ht;
                console.log(j, allColors[j-5]);
                rect.fill = new Color(allColors[j - 5].color);
                rect.stroke = null;

                selection.insertionParent.addChild(rect);
                rect.moveInParentCoordinates(offsetX + ((i - 1) * (wd + gutterX)), (offsetY + (j - 4) * (ht + gutterY)));

                selection.insertionParent.addChild(text);
                text.moveInParentCoordinates(offsetX + (gutterX + (i - 1) * (wd + gutterX)), offsetY  + (j - 4) * (ht + gutterY) + 2* gutterX);

            }

        }
    }
}

// do two loops one to set line beneath all circles
function drawEmotions(arr, selection) {
    var i, j;
    var x, y;
    var lastX = null;
    var lastY = null;
    var len = arr.length;
    for (i = 1; i < len; i++) {
        const value = parseInt(arr[i]);
        x = offsetX + ((i - 1) * (wd + gutterX)) + wd / 2 - wd / 5;
        y = (offsetY + (3) * (ht + gutterY)) + value * ht / 5;

        //add line back to previous item
        console.log(lastX, lastY);
        if(lastX!==null){
            const line = new Line();

            line.setStartEnd(
                x + wd/5,
                y + wd/5,
                lastX + wd/5,   // correct for anchor point of ellipse
                lastY + wd/5
            );

            line.strokeEnabled = true;
            line.stroke = new Color("black");
            line.strokeWidth = 3;

            selection.insertionParent.addChild(line);
            //selection.editContext.addChild(line);
        }
        lastX = x;
        lastY = y;
    }


    for (i = 1; i < len; i++) {
        const value = parseInt(arr[i]);
        x = offsetX + ((i - 1) * (wd + gutterX)) + wd / 2 - wd / 5;
        y = (offsetY + (3) * (ht + gutterY)) + value * ht / 5;
        const circ = new Ellipse();

        circ.radiusX = wd / 5;
        circ.radiusY = wd / 5;
        circ.fill = new Color(trafficLights[value][1]);
        circ.stroke = new Color('white');
        circ.strokeWidth = 10;


        selection.insertionParent.addChild(circ);
        circ.moveInParentCoordinates(x, y);
    }

}


function drawSidePanel(arr, selection) {
    const len = 5; // get first four rows to use as side-bar content
    const rect = new Rectangle();
    rect.width = wd * 2;
    rect.height = 1080;
    rect.fill = new Color("#6f777b");
    rect.stroke = null;
    rect.opacity = 1;
    selection.insertionParent.addChild(rect);
    //persona icon placeholder
    const circ = new Ellipse();
    circ.radiusX = wd / 2 - gutterX;
    circ.radiusY = wd / 2 - gutterX;
    circ.fill = null;
    circ.stroke = new Color('#dee0e2');
    circ.strokeWidth = 3;
    selection.insertionParent.addChild(circ);
    circ.moveInParentCoordinates(gutterX + wd / 2, gutterY);

    // use Persona value as page title
    var str = String(arr[0][1]);
    var text = new Text();
    text.text = str;
    text.styleRanges = [{
        length: str.length,
        fill: new Color(textFillDark[1]),
        fontSize: fontLargeSize
    }];

    selection.insertionParent.addChild(text);
    text.moveInParentCoordinates((offsetX + gutterX), (2*gutterY + ht / 2));
    var i, j, displayFont;

    for (j = 1; j < len; j++) {
        for (i = 0; i < len; i++) {
            // TODO: loop thru items and built a bullet list
            // add as an areabox.
            // get height?
            if (arr[j][i] !== null) {
                str = String(arr[j][i]);
                if (i === 0) {
                    displayFont = fontHeaderSize;
                } else {
                    displayFont = fontSize;
                }
                text = new Text();
                text.text = str;
                text.styleRanges = [{
                    length: str.length,
                    fill: new Color(textFill[1]),
                    fontSize: displayFont,
                    //fontStyle: 'bold'
                }];

                selection.insertionParent.addChild(text);
                text.moveInParentCoordinates(gutterX, offsetY - 2 * gutterX + j * (ht + gutterY) + i*16 );


            }
        }
    }

}

module.exports = {
    commands: {
        "insertTextFromFileCommand": insertTextFromFileHandler
    }
};