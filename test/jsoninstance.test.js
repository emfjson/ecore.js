/**
 *
 */

fs = require('fs');
var Ecore = require('../dist/ecore.xmi.js');
var assert = require("assert");

describe('JSON Instances of complex model (test5.xmi)', function () {
	//Read and parse the model file
	var modelSet = Ecore.ResourceSet.create();
	var model = modelSet.create({uri: 'test5.xmi'});
	var modelFile = fs.readFileSync('./test/models/test5.xmi', 'utf8');
	model.parse(modelFile, Ecore.XMI);
	var firstElement = model.get('contents').first();
	Ecore.EPackage.Registry.register(firstElement);

	// Begin testing of instances

	it('Should read minimized model (instance 1)', function () {
		var instanceSet = Ecore.ResourceSet.create();
		var instance = instanceSet.create({uri: 'test5-instance1.json'});
		var instanceFile = fs.readFileSync('./test/models/test5-instance1.json', 'utf8');
		instance.parse(instanceFile);

		var instanceJSON = instance.to(Ecore.JSON, true);
		var expectedJSON = {
			eClass: 'test5.xmi#//Info',
			subInfo: [{
				eClass: 'test5.xmi#//SubordinateInfo',
				name: 'subinfo1'
			}, {
				eClass: 'test5.xmi#//SubordinateInfo',
				name: 'subinfo2'
			}],
			name: 'info'
		};

		assert.equal(JSON.stringify(instanceJSON), JSON.stringify(expectedJSON));
	});

});