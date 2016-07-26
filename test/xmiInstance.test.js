/**
 * 
 */

fs = require('fs');
var Ecore = require('../dist/ecore.xmi.js');
var assert = require("assert");

describe('XMI Instances of complex model (test5.xmi)', function(){
	//Read and parse the model file
	var modelSet = Ecore.ResourceSet.create();
	var model = modelSet.create({uri : 'test5.xmi'});
	var modelFile = fs.readFileSync('./test/models/test5.xmi', 'utf8');
	model.parse(modelFile, Ecore.XMI);
	var firstElement = model.get('contents').first();
	Ecore.EPackage.Registry.register(firstElement);
	
	// Begin testing of instances
	
	it('should parse reflexive relations (instance 1)', function() {
		var instanceSet = Ecore.ResourceSet.create();
		var instance = instanceSet.create({uri : 'test5-instance1.xmi'});
		var instanceFile = fs.readFileSync('./test/models/test5-instance1.xmi', 'utf8');
		instance.parse(instanceFile, Ecore.XMI);
		
		assert.equal(instance.to(Ecore.XMI, true), instanceFile); 
	});
	
	it('should parse nested instance data (instance 2)', function() {
		var instanceSet = Ecore.ResourceSet.create();
		var instance = instanceSet.create({uri : 'test5-instance2.xmi'});
		var instanceFile = fs.readFileSync('./test/models/test5-instance2.xmi', 'utf8');
		instance.parse(instanceFile, Ecore.XMI);
		
		assert.equal(instance.to(Ecore.XMI, true), instanceFile); 
	});
	
	it('should parse references (instances-3)', function() {
		var instanceSet = Ecore.ResourceSet.create();
		
		var instance3a = instanceSet.create({uri : 'test5-instance3a.xmi'});
		var instance3b = instanceSet.create({uri : 'test5-instance3b.xmi'});
		var instance3c = instanceSet.create({uri : 'test5-instance3c.xmi'});
		
		var i3aFile = fs.readFileSync('./test/models/test5-instance3a.xmi', 'utf8');
		var i3bFile = fs.readFileSync('./test/models/test5-instance3b.xmi', 'utf8');
		var i3cFile = fs.readFileSync('./test/models/test5-instance3c.xmi', 'utf8');
		
		instance3a.parse(i3aFile, Ecore.XMI);
		instance3b.parse(i3bFile, Ecore.XMI);
		instance3c.parse(i3cFile, Ecore.XMI);
		
		assert.equal(instance3a.to(Ecore.XMI, true), i3aFile);
		assert.equal(instance3b.to(Ecore.XMI, true), i3bFile); 
		assert.equal(instance3c.to(Ecore.XMI, true), i3cFile); 
	});
});