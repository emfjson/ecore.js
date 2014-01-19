fs = require('fs');
var Ecore = require('ecore');

var onSuccess = function(result) {
    var ePackage = result.get('contents').first();

    console.log('loaded ePackage', ePackage.get('name'));
    console.log('eClassifiers', ePackage.get('eClassifiers').map(function(c) {
        return c.get('name') + ' superTypes(' + c.get('eSuperTypes').map(function(s) {
            return s.get('name');
        }).join(', ') + ') features(' + c.get('eStructuralFeatures').map(function(f) {
            return f.get('name') + ' : ' + f.get('eType').get('name');
        }).join(', ') + ')';
    }));
};

var onError = function(err) {
    console.log('fail loading model', err);
};

fs.readFile('./model.json', 'utf8', function (err,data) {
    if (err) return console.log(err);

    var model = Ecore.Resource.create({ uri: 'model.json' });

    model.load(onSuccess, onError, { data: JSON.parse(data) });
});

fs.readFile('./model.xmi', 'utf8', function (err,data) {
    if (err) return console.log(err);

    var model = Ecore.Resource.create({ uri: 'model.json' });

    model.load(onSuccess, onError, { data: data, format: Ecore.XMI });
});

