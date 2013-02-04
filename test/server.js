_ = require('underscore');
var Ecore = require('../dist/ecore.js');
var express = require('express');
var app = express();


app.use('/', express.static(__dirname + '/'));

var resourceSet = Ecore.ResourceSet.create();
resourceSet.uriConverter().map('/models/', 'http://www.example.org/models/');
resourceSet.uriConverter().map('/models/ecore', Ecore.EcorePackage.get('nsURI'));

function find(uri) {
    return _.find(resourceSet.get('resources').array(), function(model) {
        return model.get('uri') === uri;
    });
}

function buildSimpleModel() {
    var resource = Ecore.Resource.create({ uri: 'http://www.example.org/models/sample' });
    var User = Ecore.EClass.create({ name: 'User' });
    var UserName = Ecore.EAttribute.create({ name: 'userName', eType: Ecore.EString });
    var UserFriends = Ecore.EReference.create({ name: 'friends', upperBound: -1, eType: User });
    User.get('eStructuralFeatures').add(UserName).add(UserFriends);

    var sample = Ecore.EPackage.create({ name: 'sample', nsPrefix: 'sample', nsURI: 'http://www.example.org/sample' });
    sample.get('eClassifiers').add(User);

    resource.add(sample);
    resourceSet.get('resources').add(resource);
    Ecore.EPackage.Registry.register(sample);

    return resource;
}

buildSimpleModel();

app.get('/models/:id', function(req, res) {
    var normalized = resourceSet.uriConverter().normalize(req.path),
        model = resourceSet.create({ uri: normalized }),
        body = model.to(Ecore.XMI, true);

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Length', body.length);
    res.end(body);
});

app.listen(3000);
console.log('listen on 3000');

