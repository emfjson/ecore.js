_ = require('underscore');
fs = require('fs');
var Ecore = require('../dist/ecore.js');
require('../dist/ecore.xmi.js');

var resourceSet = Ecore.ResourceSet.create();
var resource = resourceSet.create({ uri: 'sample.json' });

function loaded(resource) {
    console.log(resource.get('contents').map(function(e) {
        return { nsURI: e.get('nsURI') };
    }));
}

fs.readFile('./test/simple.xmi', 'utf8', function (err,data) {
    if (err) return console.log(err);

    resource.load(loaded, function(){}, JSON.parse(data), Ecore.XMI);
});

