fs = require('fs');
var Ecore = require('../../dist/ecore.xmi');

var callback = function(model, err) {
    if (err) {
        console.log('fail loading model', err);
        return;
    }

    var ePackage = model.get('contents').first();

    console.log('loaded ePackage', ePackage.get('name'));
    console.log('eClassifiers', ePackage.get('eClassifiers').map(function(c) {
        return c.get('name') + ' superTypes(' + c.get('eSuperTypes').map(function(s) {
            return s.get('name');
        }).join(', ') + ') features(' + c.get('eStructuralFeatures').map(function(f) {
            return f.get('name') + ' : ' + f.get('eType').get('name');
        }).join(', ') + ')';
    }));
};

fs.readFile('./model.json', 'utf8', function (err,data) {
    if (err) return console.log(err);

    Ecore.Resource.create({ uri: 'model.json' }).load(data, callback);
});

fs.readFile('./model.xmi', 'utf8', function (err,data) {
    if (err) return console.log(err);

    Ecore.Resource.create({ uri: 'model.xmi' }).load(data, callback, {format: Ecore.XMI});
});

