/**
 * 
 */

fs = require('fs');
var Ecore = require('../dist/ecore.xmi.js');
var assert = require("assert");

describe('Parsing of invalid model files', function() {
	it('should detect an invalid eSuperType', function() {
		//test6.xmi is the same as test5.xmi except for name changing and
		//the eSuperType of 'SpecialItem' on line 16 is 'Invalid'.
		//Present behavior is that the offending eSuperType entry is
		//simply removed silently.
		
		var modelSet = Ecore.ResourceSet.create();
		var model = modelSet.create({uri : 'test6.xmi'});
		var modelFile = fs.readFileSync('./test/models/test6.xmi', 'utf8');
		var passFlag = false;
		try {
			model.parse(modelFile, Ecore.XMI);
		} catch(err) {
			passFlag = true;
		}
		assert.equal(passFlag, true);
		
//		firstElement = model.get('contents').first();
//		Ecore.EPackage.Registry.register(firstElement);
//		
//		workingPath = Ecore.EPackage.Registry
//						   .getEPackage('http://www.example.org/test6')
//						   .values.eClassifiers._internal[1]
//						   .values.eAnnotations._owner;
//		
//		superTypes = workingPath.values.eSuperTypes;
//		// name === workingpath.values.name
//		// # of supertypes === workingPath.values.eSuperTypes._size
//		// Since 'SpecialItem' has no valid supertypes, its size is zero
//		assert.equal(superTypes._size, 0);
		
	});
	
	it('should detect invalid class types in instances', function() {
		// This test should detect that an instance of test5.xmi
		// has an invalid type. Child 2 in test5-instance4.xmi has
		// invalid type. The correct version of instance4 is instance1.
		var modelSet = Ecore.ResourceSet.create();
		var model = modelSet.create({uri : 'test5.xmi'});
		var modelFile = fs.readFileSync('./test/models/test5.xmi', 'utf8');
		model.parse(modelFile, Ecore.XMI);
		var firstElement = model.get('contents').first();
		Ecore.EPackage.Registry.register(firstElement);
		
		var instanceSet = Ecore.ResourceSet.create();
		var instance = instanceSet.create({uri : 'test5-instance4.xmi'});
		var instanceFile = fs.readFileSync('./test/models/test5-instance4.xmi', 'utf8');
		
		try{
			instance.parse(instanceFile, Ecore.XMI);
		} catch(err) {
			assert.equal(err.toString(), "Error: child has undefined/invalid eClass.");
		}
	});
	
});