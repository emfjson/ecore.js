fs = require('fs');
var Ecore = require('../../dist/ecore.js');
var Bench = require('./bench.js');
var assert = require("assert");


var model = Ecore.Resource.create({ uri: 'simple' });
var onSuccess = function(result) {};
var onError = function() {};

fs.readFile('../models/simple.json', 'utf8', function (err,data) {
    if (err) { return console.log(err); }

    var input = { data: JSON.parse(data) };

    Bench.bench(model.load, 20, [onSuccess, onError, input], model);
});

fs.readFile('../models/test1.xmi', 'utf8', function (err,data) {
    if (err) { return console.log(err); }

    var input = { data: data, format: Ecore.XMI };

    Bench.bench(model.load, 20, [onSuccess, onError, input], model);
});

fs.readFile('../models/test2.xmi', 'utf8', function (err,data) {
    if (err) { return console.log(err); }

    var input = { data: data, format: Ecore.XMI };

    Bench.bench(model.load, 20, [onSuccess, onError, input], model);
});
