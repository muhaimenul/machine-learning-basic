// server.js
// where your node app starts
// Author Muhaimenul Islam (www.github.com/I-Muhaimenul)

// init project
const express = require('express');
const app = express();

// brain.js
const brain = require('brain.js');

const fs = require('fs');

const data = require('./data/data.json');

const networkPath = './data/hardware-software-cached.network.json';
// const network = new brain.NeuralNetwork();
// for string or array
const network = new brain.recurrent.LSTM();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
const cors = require('cors');
app.use(cors({
    optionSuccessStatus: 200
})); // some legacy browsers choke on 204


// your first nural network endpoint... 
app.get("/first", function (req, res) {
    // network.train([
    //     {input: { r: 0.03, g: 0.7, b: 0.5 }, output: { black: 1 }},
    //     {input: { r: 0.16, g: 0.09, b: 0.2 }, output: { white: 1 }},
    //     {input: { r: 0.5, g: 0.5, b: 1.0 }, output: { white: 1 }}
    // ]);

    // const output = network.run({ r: 1, g: 0.4, b: 0 });  // { white: 0.99, black: 0.02 }
    network.train([{
            input: [0, 0, 0, ],
            output: [0]
        },
        {
            input: [0, 0, 1, ],
            output: [0]
        },
        {
            input: [0, 1, 1, ],
            output: [0]
        },
        {
            input: [1, 0, 1, ],
            output: [1]
        },
        {
            input: [1, 1, 1, ],
            output: [1]
        },
    ]);

    const output = network.run([1, 0, 0]); // [1]
    res.json({
        output: output
    });
});

app.get("/second", function (req, res) {
    network.train([{
            input: [1, 2],
            output: [1]
        }, // Team 2 wins
        {
            input: [1, 3],
            output: [1]
        }, // Team 3 wins
        {
            input: [2, 3],
            output: [0]
        }, // Team 2 wins
        {
            input: [2, 4],
            output: [1]
        }, // Team 4 wins
        {
            input: [1, 2],
            output: [0]
        }, // Team 1 wins
        {
            input: [1, 3],
            output: [0]
        }, // Team 1 wins
        {
            input: [3, 4],
            output: [0]
        } // Team 3 wins
    ]);

    const output = network.run([1, 4]);
    res.json({
        output: output
    });
});

const trainingData = data.map(item => ({
    input: item.text,
    output: item.category
}));
app.get("/hw-sw", function (req, res) {
    network.train(trainingData, {
        iterations: 2000
    });

    const output = network.run('I fixed the power supply');
    res.json({
        output: output
    });
});

app.get("/hw-sw-cache", function (req, res) {
    let networkData = null;
    if (fs.existsSync(networkPath)) {
        networkData = JSON.parse(fs.readFileSync(networkPath));
        network.fromJSON(networkData);
    } else {
        network.train(trainingData, {
            iterations: 2000
        });
        fs.writeFileSync(networkPath, JSON.stringify(network.toJSON(), null, 2));
    }

    const output = network.run('The code has some bugs')
    res.json({
        output: output
    });
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
    res.json({
        greeting: 'hello API'
    });
});


// listen for requests :)
const port = process.env.PORT || 3000;
const listener = app.listen(port, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});