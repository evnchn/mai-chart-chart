// ==UserScript==
// @name         mai-chart-chart
// @namespace    https://github.com/evnchn/mai-chart-chart
// @version      1.0
// @description  Generates a chart and exports the chart data of mai-tools Rating Analyzer
// @author       evnchn
// @match        https://myjian.github.io/mai-tools/rating-calculator/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function fallbackCopyTextToClipboard(text) {
        var textArea = document.createElement("textarea");
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Fallback: Copying text command was ' + msg);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }

        document.body.removeChild(textArea);
    }


    function extract_mai_tools_data() {
        // Generated with Poe. Prompt here:
        // https://poe.com/s/wo0SFXk51vRy5lYWOTKP

        // meant to be used with "Analyze Rating" page of https://github.com/myjian/mai-tools
        // ONLY after data has been loaded!!!

        // FOR DATA EXPORT TO EXCEL
        // Table data will be copied to clipboard. Paste to Microsoft Excel directly

        // FOR DATA EXPORT TO OTHER JS FUNCTIONS
        // return array have the data. arr[0] is new charts. arr[1] is old charts

        // Get all elements with class "songRecordTable"
        const songTables = document.querySelectorAll(".songRecordTable");

        // Initialize two empty arrays for the rating cells
        const list1 = [];
        const list2 = [];

        // Iterate over the song tables
        for (let i = 0; i < songTables.length; i++) {
            const songTable = songTables[i];

            // Get all <td> elements with class "ratingCell" within the current song table
            const ratingCells = songTable.querySelectorAll("td.ratingCell");

            // Iterate over the rating cells
            for (let j = 0; j < ratingCells.length; j++) {
                const ratingCell = ratingCells[j];

                // Parse the innerText of the rating cell as an integer and add it to the corresponding list
                const rating = parseInt(ratingCell.innerText);
                if (i === 0) {
                    list1.push(rating);
                } else if (i === 1) {
                    list2.push(rating);
                }
            }
        }

        // Generate the table as a single string
        let tableString = "List 1\tList 2\n";
        for (let i = 0; i < Math.max(list1.length, list2.length); i++) {
            const value1 = i < list1.length ? list1[i] : "";
            const value2 = i < list2.length ? list2[i] : "";
            tableString += `${value1}\t${value2}\n`;
        }

        // Print the table string to the console
        console.log(tableString);

        // MANUAL EDIT: copy the table string to clipboard
        fallbackCopyTextToClipboard(tableString);

        return [list1, list2]
    }




    function drawDataLists(list1, list2) {
        // Generated with Poe. Prompt here: https://poe.com/s/C1UTSJCNIwzB2WIuzDOo
        // Create a pop-up canvas container
        const canvasContainer = document.createElement('div');
        canvasContainer.style.position = 'fixed';
        canvasContainer.style.top = '0';
        canvasContainer.style.left = '0';
        canvasContainer.style.width = '100%';
        canvasContainer.style.height = '100%';
        canvasContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        canvasContainer.style.display = 'flex';
        canvasContainer.style.flexDirection = 'column';
        canvasContainer.style.justifyContent = 'center';
        canvasContainer.style.alignItems = 'center';

        // Create a pop-up canvas
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth*2;
        canvas.height = window.innerHeight*2;
        canvas.style.border = '1px solid black';
        canvas.style.width = '90%';

        // Append the canvas to the canvas container
        canvasContainer.appendChild(canvas);

        // Find the minimum and maximum values from both lists
        const minValue = Math.min(...list1, ...list2);
        const maxValue = Math.max(...list1, ...list2);

        // Get the canvas context
        const ctx = canvas.getContext('2d');

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Plot list1
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - ((list1[0] - minValue) / (maxValue - minValue)) * canvas.height);
        for (let i = 1; i < list1.length; i++) {
            const x = (i / (list1.length - 1)) * canvas.width;
            const y = canvas.height - ((list1[i] - minValue) / (maxValue - minValue)) * canvas.height;
            ctx.lineTo(x, y);
        }
        ctx.lineWidth = window.devicePixelRatio*10;
        ctx.strokeStyle = 'blue';
        ctx.stroke();

        // Plot list2
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - ((list2[0] - minValue) / (maxValue - minValue)) * canvas.height);
        for (let i = 1; i < list2.length; i++) {
            const x = (i / (list2.length - 1)) * canvas.width;
            const y = canvas.height - ((list2[i] - minValue) / (maxValue - minValue)) * canvas.height;
            ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'red';
        ctx.stroke();

        // Create a newline element
        const newline = document.createElement('br');

        // Append the newline element to the canvas container
        canvasContainer.appendChild(newline);

        // Create a dismiss button
        const dismissButton = document.createElement('button');
        dismissButton.innerText = 'Dismiss';

        // Append the dismiss button to the canvas container
        //canvasContainer.appendChild(dismissButton);

        // Add a click event listener to the dismiss button
        // MANUAL EDIT: Let this be the job of the container
        canvasContainer.addEventListener('click', () => {
            // Remove the canvas container from the body
            document.body.removeChild(canvasContainer);
        });

        // Get the body element and append the canvas container to it
        const body = document.querySelector('body');
        body.appendChild(canvasContainer);
    }

    function show_mai_tools_data() {
        var arr = extract_mai_tools_data();
        drawDataLists(arr[0], arr[1]);
    }

    var button = document.createElement("button");
    button.innerHTML = "mai chart chart";
    button.addEventListener("click", show_mai_tools_data);
    document.body.prepend(button);

})();