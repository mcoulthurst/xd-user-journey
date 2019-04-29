'use strict';
const { Rectangle, Ellipse , Text, Color } = require("scenegraph");
const assets = require("assets");
const CSV = require("./csv");
const fs = require("uxp").storage.localFileSystem;
const textFill = ["grey-3", '#dee0e2'];
const trafficLights =[
    ["green", '#006435'],
    ["green (button)", '#00823b'],
    ["light-green", '#85994b'],
    ["yellow", '#ffbf47'],
    ["orange", '#f47738'],
    ["bright-red", '#df3034'],
    ["red", '#b10e1e']
];
const rowColor =[
    ["light-blue", '#2b8cc4'],
    ["green (button)", '#00823b'],
    ["bright-purple", '#912b88'],
    ["light-purple", '#6f72af'],
    ["orange", '#f47738'],
    ["bright-red", '#df3034']
];

const ht = 100;
const wd = 160;
const gutterX = 5;
const gutterY = 32;
var fontSize = 12;
var fontHeaderSize = 18;
var fontLargeSize = 48;
var offsetX = 2*wd + gutterX;
var offsetY = 2 * gutterY;





async function insertTextFromFileHandler(selection) {

    // TODO get existing assets colours and use frist frou as row fills

    const aFile = await fs.getFileForOpening({ types: ["txt","csv"] });
    if (!aFile){
        return;
    }

    const contents = await aFile.read();
    const arr = CSV.parse(contents);

    // draw side panel
    drawSidePanel(arr, selection);

    var rows = arr.length;
    for (var j=5; j<rows; j++){

        var cols = arr[j].length;
        // process the emotions with emoticons
        if(j===7){
            drawEmotions(arr[j], selection);
        }

        // double ht line for journey emotions
        if(j===8){
            offsetY = offsetY + ht;
        }

        for (var i=0; i<cols; i++){
            if(i==0){
                // add header
                var str = String(arr[j][i]).toUpperCase();
                const text = new Text();
                text.text = str;
                text.styleRanges = [{
                    length: str.length,
                    fill: new Color("black"),
                    fontSize: fontHeaderSize
                }];
                selection.insertionParent.addChild(text);
                text.moveInParentCoordinates( offsetX +(gutterX+(i)*(wd+gutterX)), offsetY - 2*gutterX+ (j-4)*(ht+gutterY) );
            }

            if(arr[j][i]!==null && i>0 && j!==7){
                var str = String(arr[j][i]); // cast to string so we can get length
                const text = new Text();
                text.areaBox = {width:wd-gutterX*3, height:ht};
                text.text = str;
                text.styleRanges = [{
                    length: str.length,
                    fill: new Color(textFill[1]),
                    fontSize: fontSize
                }];

                const rect = new Rectangle();
                rect.width = wd;
                rect.height = ht;
                rect.fill = new Color(rowColor[j-5][1]);
                rect.stroke = null;

                selection.insertionParent.addChild(rect);
                rect.moveInParentCoordinates( offsetX +((i-1)*(wd+gutterX)), (offsetY + (j-4)* (ht+gutterY)) );

                selection.insertionParent.addChild(text);
                text.moveInParentCoordinates( offsetX +(gutterX+(i-1)*(wd+gutterX)), offsetY + 2*gutterX+ (j-4)*(ht+gutterY) );

            }

        }
    }
}


function drawEmotions(arr, selection) {
    var len = arr.length;

    for (var i=1; i<len; i++){
        const circ = new Ellipse ();
        const value = parseInt(arr[i]);
        circ.radiusX  = wd/5;
        circ.radiusY  = wd/5;
        circ.fill = new Color(trafficLights[value][1]);
        circ.stroke = null;

        selection.insertionParent.addChild(circ);
        circ.moveInParentCoordinates( offsetX +((i-1)*(wd+gutterX)) + wd/2 - wd/5, (offsetY + (3)* (ht+gutterY)) + value*ht/5 );
    }

}


function drawSidePanel(arr, selection) {
    const len = 5; // get first four rows to use as side-bar content
    const rect = new Rectangle();
    rect.width = wd*2;
    rect.height = 1920; // TODO get artboard ht
    rect.fill = new Color("#6f777b");
    rect.stroke = null;
    rect.opacity = 1;
    selection.insertionParent.addChild(rect);
    //persona icon placeholder
    const circ = new Ellipse ();
    circ.radiusX  = wd/2-gutterX;
    circ.radiusY  = wd/2-gutterX;
    circ.fill = null;
    circ.stroke = new Color('#dee0e2');
    selection.insertionParent.addChild(circ);
    circ.moveInParentCoordinates( gutterX+wd/2, gutterX );

    // use Persona value as page title
    var str = String(arr[0][1])
    const text = new Text();
    text.text = str;
    text.styleRanges = [{
        length: str.length,
        fill: new Color(textFill[1]),
        fontSize: fontLargeSize
    }];

    selection.insertionParent.addChild(text);
    text.moveInParentCoordinates( (offsetX + gutterX), (gutterY + ht/2) );

    for (var j=1; j<len; j++){
        var displayFont;
        for (var i=0; i<len; i++){
            // TODO: loop thru items and built a bullet list
            // add as an areabox.
            // get height?
            if(arr[j][i]!==null){``
                var str = String(arr[j][i]);
                if(i===0){
                    displayFont = fontHeaderSize;
                }else{
                    displayFont = fontSize;
                }
                const text = new Text();
                text.text = str;
                text.styleRanges = [{
                    length: str.length,
                    fill: new Color(textFill[1]),
                    fontSize: displayFont,
                    fontStyle: 'bold'
                }];

                selection.insertionParent.addChild(text);
                text.moveInParentCoordinates( gutterX, ((i*16)+ (j*(ht+gutterY*3))) );
            }
        }
    }

}

module.exports = {
    commands: {
        "insertTextFromFileCommand": insertTextFromFileHandler
    }
};
