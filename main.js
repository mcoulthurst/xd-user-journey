'use strict';
const { alert, error } = require("./lib/dialogs.js");
const { Line, Rectangle, Ellipse, Text, Color } = require("scenegraph");
const CSV = require("./lib/csv");
const fs = require("uxp").storage.localFileSystem;
var assets = require("assets");


const palette = [
    ["Side Panel", '#6F777B'],
    ["Side Text", '#DEE0E2'],
    ["Tasks", '#A7488C'],
    ["Personas", '#35C0BD'],
    ["Touch Points", '#2C3E50'],
    ["Pain Points", '#F15159'],
    ["Dark Text", '#4C4743']
];

const sidePanelFill = palette[0][1];
const sidePanelText = palette[1][1];
const titleText = '#ffffff';
const defaultText = palette[6][1];


const ht_row = 170;
const wd_row = 30;
const wd_full = 1920;
const wd_offset = 330;
const ht_offset = 190;

const ht = 100;
const wd = 160;
const gutter = 10;
const gutterX = 5;
const gutterY = 32;

var offsetX = 2 * wd + gutterX;
var offsetY = 110;

var fontSize = 12;
var fontHeaderSize = 18;
var fontLargeSize = 48;
var allColors;



async function createUserJourney(selection) {
    var i, j;

    const aFile = await fs.getFileForOpening({ types: ["txt", "csv"] });
    if (!aFile) {
        return;
    }

    const contents = await aFile.read();
    const arr = CSV.parse(contents);
    offsetY = 110;


    if(arr.length<6 ){
        showError('Not enough Data');
    }else if(arr.length>20 ){
        showError('Too Many Rows');
    }else{
        drawSidePanel(arr.slice(0,5), selection);

        drawJourney(arr.slice(5), selection);
    }
}

function drawJourney(arr, selection) {
    console.log(arr);
    var rows = arr.length;
    var cols;
    var text;
    var i,j;

    // draw background rows and title blocks
    var str = " ";
    for (j = 0; j < rows; j++) {
        // draw row
        var rect = new Rectangle();
        rect.width = wd_full;
        rect.height = ht_row;
        rect.fill = new Color(palette[j+2][1], 0.1);
        rect.stroke = null;
        selection.insertionParent.addChild(rect);
        rect.moveInParentCoordinates(wd_offset + gutter + wd_row, (ht_offset + j * (ht_row + gutter) ) );

        // draw header
        var rect = new Rectangle();
        rect.width = wd_row;
        rect.height = ht_row;
        rect.fill = new Color(palette[j+2][1]);
        rect.stroke = null;
        selection.insertionParent.addChild(rect);
        rect.moveInParentCoordinates(wd_offset, (ht_offset + j * (ht_row + gutter)));

        // text

        if (arr[j][0] !== null && arr[j][0] !== ""){
            str = String(arr[j][0]);
        }
        text = new Text();
        text.text = str;
        text.styleRanges = [{
            length: str.length,
            fill: new Color(titleText),
            fontSize: fontHeaderSize
        }];
        //text.rotation = 90;
        selection.insertionParent.addChild(text);
        text.moveInParentCoordinates(wd_offset + wd_row/2, (ht_offset + j * (ht_row + gutter)) + ht_row/2);

    }

    /*
    for (j = 0; j < rows; j++) {
        cols = arr[j].length;
        // process the emotions with emoticons
        if (j === 7) {
            drawEmotions(arr[j], selection);
        }

        // double ht line for journey emotions
        if (j === 8) {
            offsetY = offsetY + ht;
        }

        var str = " ";
        for (i = 0; i < cols; i++) {
            if (i == 0) {
                // add header
                if (arr[j][i] !== null && arr[j][i] !== ""){
                    str = String(arr[j][i]);
                }
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
                if (arr[j][i] !== "") {
                    var str = String(arr[j][i]); // cast to string so we can get length
                    text = new Text();
                    text.areaBox = { width: wd - gutterX * 3, height: ht };
                    text.text = str;
                    text.styleRanges = [{
                        length: str.length,
                        fill: new Color(textFill[1]),
                        fontSize: fontSize
                    }];
                }

                const rect = new Rectangle();
                rect.width = wd;
                rect.height = ht;
                rect.fill = new Color(allColors[j - 5].color);
                rect.stroke = null;

                selection.insertionParent.addChild(rect);
                rect.moveInParentCoordinates(offsetX + ((i - 1) * (wd + gutterX)), (offsetY + (j - 4) * (ht + gutterY)));

                if (arr[j][i] !== "") {
                    selection.insertionParent.addChild(text);
                    text.moveInParentCoordinates(offsetX + (gutterX + (i - 1) * (wd + gutterX)), offsetY  + (j - 4) * (ht + gutterY) + 2* gutterX);
                }
            }
        }
    }*/
}


// do two loops one to set line beneath all circles
function drawEmotions(arr, selection) {
    var i, j;
    var x, y;
    var lastX = null;
    var lastY = null;
    var value;
    var len = arr.length;
    for (i = 1; i < len; i++) {
        // default value
        value = 1;
        if(arr[i]!==null){
            value = parseInt(arr[i]);
        }

        x = offsetX + ((i - 1) * (wd + gutterX)) + wd / 2 - wd / 5;
        y = (offsetY + (3) * (ht + gutterY)) + value * ht / 5;

        //add line back to previous item
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
        }

        lastX = x;
        lastY = y;
    }

    for (i = 1; i < len; i++) {
        // default value
        value = 1;
        if(arr[i]!==null){
            value = parseInt(arr[i]);
        }
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
    console.log("-------------------------");
    const len = 5; // get first four rows to use as side-bar content
    const rect = new Rectangle();
    rect.width = wd * 2;
    rect.height = 1080;
    rect.fill = new Color(sidePanelFill);
    rect.stroke = null;
    rect.opacity = 1;
    selection.insertionParent.addChild(rect);
    //persona icon placeholder
    const circ = new Ellipse();
    circ.radiusX = wd / 2 - gutterX;
    circ.radiusY = wd / 2 - gutterX;
    circ.fill = null;
    circ.stroke = new Color(sidePanelText);
    circ.strokeWidth = 3;
    selection.insertionParent.addChild(circ);
    circ.moveInParentCoordinates(gutterX + wd / 2, gutterY);

    // use Persona value as page title
    var str = "User";
    if(arr[0][1]!==null && arr[0][1]!==""){
        str = String(arr[0][1]);
    }
    var text = new Text();
    text.text = str;
    text.styleRanges = [{
        length: str.length,
        fill: new Color(defaultText),
        fontSize: fontLargeSize
    }];

    selection.insertionParent.addChild(text);
    text.moveInParentCoordinates((offsetX + gutterX), (2*gutterY + ht / 2));

    var i, j, displayFont;
    var rowLength = 0;
    for (j = 1; j < len; j++) {
        console.log("row" + arr[j]);
        rowLength = arr[j].length;
        for (i = 0; i < rowLength; i++) {
            console.log(arr[j][i]);
            // TODO: loop thru items and built a bullet list
            // add as an areabox.
            // get height?
            if (arr[j][i] !== null && arr[j][i] !== "") {
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
                    fill: new Color(sidePanelText),
                    fontSize: displayFont
                }];

                selection.insertionParent.addChild(text);
                text.moveInParentCoordinates(gutterX, offsetY - 2 * gutterX + j * (ht + gutterY) + i*16 );


            }
        }
    }

}


async function showError(header) {
    /* we'll display a dialog here */
    await error("CSV File Import Failed: " + header,
        "Failed to load the selected file. Please check the file format:",
        "* There needs to be 5 rows: for Persona, Roles, Goals, Needs and Expectations",
        "* Then there needs to be 6 rows: for Tasks, Persona, Emotion, Touch points and Pain points",
        "* See the plugin help page for more information");}



module.exports = {
    commands: {
        "createUserJourney": createUserJourney
    }
};