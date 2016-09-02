/**
 * 
 */

fs = require('fs');
util = require('util');
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
		
		var instanceJSON = instance.to(Ecore.JSON, false);
		var expectedJSON = { 
				eClass: 'test5.xmi#//Simple',
				name: 'SimpleTest',
				info: 
					[ { eClass: 'test5.xmi#//Info', value: '1', name: 'Info 1' },
					  { eClass: 'test5.xmi#//Info',
						value: '2',
						subInfo: 
							[ { eClass: 'test5.xmi#//SubordinateInfo', name: 'Sub 2-1' },
							  { eClass: 'test5.xmi#//SubordinateInfo',
								test: 'true',
								name: 'Sub 2-2' },
								{ eClass: 'test5.xmi#//SubordinateInfo', name: 'Sub 2-3' } ],
								name: 'Info 2' },
								{ eClass: 'test5.xmi#//Info', value: '3', name: 'Info 3' } ] };
		//console.log(util.inspect(instanceJSON, false, null));
		assert.equal(JSON.stringify(instanceJSON), JSON.stringify(expectedJSON));
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
	
	it('should parse attributes which are XMI elements (instance-5b)', function() {
		var instanceSet = Ecore.ResourceSet.create();
		var instance = instanceSet.create({uri : 'test5-instance5b.xmi'});
		var instanceFile = fs.readFileSync('./test/models/test5-instance5b.xmi', 'utf8');
		instance.parse(instanceFile,Ecore.XMI);
		
		assert.equal(instance.eContents()[0].values['newString'], 'A string.');
		//equivalent: assert.equal(instance.values.contents._internal[0].values.newString, 'A String.');
	});
	
	it('should parse an XMI file with multiple instances and namespaces', function() {
		var newmodelSet = Ecore.ResourceSet.create();
		var newmodel = newmodelSet.create({uri : 'test1.xmi'});
		var newmodelFile = fs.readFileSync('./test/models/test1.xmi', 'utf8');
		newmodel.parse(newmodelFile, Ecore.XMI);
		var newfirstElement = newmodel.get('contents').first();
		Ecore.EPackage.Registry.register(newfirstElement);
		
		var multiInstanceSet = Ecore.ResourceSet.create();
		var multiInstance = multiInstanceSet.create({uri : 'test5-multipleinstances.xmi'});
		var multiInstanceFile = fs.readFileSync('./test/models/test5-multipleinstances.xmi', 'utf8');
		multiInstance.parse(multiInstanceFile,Ecore.XMI);
			
		assert.equal(multiInstance.to(Ecore.XMI, true), multiInstanceFile);
	});
	
	it('should escape invalid characters in attributes when printing', function() {
		
		var instanceSet = Ecore.ResourceSet.create();
		var instance = instanceSet.create({uri : 'test5-instance6.xmi'});
		var instanceFile = fs.readFileSync('./test/models/test5-instance6.xmi', 'utf8');
		instance.parse(instanceFile, Ecore.XMI);
		
		assert.equal(instance.to(Ecore.XMI, true), instanceFile);
	});
	
	it('should parse instances with xmi:id', function() {
		var instanceSet = Ecore.ResourceSet.create();
		var instance = instanceSet.create({uri : 'test5-idtest1.xmi'});
		var instanceFile = fs.readFileSync('./test/models/test5-idtest1.xmi', 'utf8');
		instance.parse(instanceFile, Ecore.XMI);
		
		assert.equal(instance.to(Ecore.XMI, true), instanceFile);
	});
	
	it('should parse references via xmi:id and href', function() {
		var instanceSet = Ecore.ResourceSet.create();
		var instance1 = instanceSet.create({uri : 'test5-idtest1.xmi'});
		var instance1File = fs.readFileSync('./test/models/test5-idtest1.xmi', 'utf8');
		instance1.parse(instance1File, Ecore.XMI);
		
		var instance2 = instanceSet.create({uri : 'test5-idtest2.xmi'});
		var instance2File = fs.readFileSync('./test/models/test5-idtest2.xmi', 'utf8');
		instance2.parse(instance2File, Ecore.XMI);
		
		assert.equal(instance2.to(Ecore.XMI, true), instance2File);
	});
});