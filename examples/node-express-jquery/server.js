_ = require('underscore');
var fs = require('fs');
var Ecore = require('ecore');
var express = require('express');
var app = express();

app.use(express.bodyParser());
app.use('/', express.static(__dirname + '/static'));

var resourceSet = Ecore.ResourceSet.create();

var dirName = './models';
var files = fs.readdirSync(dirName);
var resource;

_.each(files, function(file) {
    fs.readFile(dirName + '/' + file, 'utf-8', function (err, data) {
        if (err) throw err;
        resource = resourceSet.create({ uri: file });
        resource.load(function(resource) {
            console.log(resource.get('uri') + ' loaded');
        }, function() {
            console.log('cannot load ' + file);
        }, { data: data, format: Ecore.XMI });
    });
});

app.get('/api/models', function(req, res) {
    var data = resourceSet.toJSON();
    var body = JSON.stringify(data);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', body.length);
    res.end(body);
});

app.get('/api/models/:id', function(req, res) {
    var model = resourceSet.create({ uri: req.params.id }),
        body = JSON.stringify(model.to(Ecore.JSON));

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', body.length);
    res.end(body);
});

app.listen(3000);
console.log('listen on 3000');

