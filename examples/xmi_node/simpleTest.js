//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////

fs = require('fs');
util = require('util');
//Ecore = require('ecore/dist/ecore.xmi');
Ecore = require('../../dist/ecore.xmi');

var resourceSet = Ecore.ResourceSet.create();

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function displayModelInfo(model) {

  // Note: This function is extracted from the callback function from the 
  // main.js in the node example

  var ePackage = model.get('contents').first();

  console.log('loaded ePackage', ePackage.get('name'));
  console.log('eClassifiers', ePackage.get('eClassifiers').map(function(c) {
      return c.get('name') + ' superTypes(' + c.get('eSuperTypes').map(function(s) {
          return s.get('name');
      }).join(', ') + ') features(' + c.get('eStructuralFeatures').map(function(f) {
          return f.get('name') + ' : ' + f.get('eType').get('name');
      }).join(', ') + ')';
  }));  
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function processFile(file) {
  
  var resource = resourceSet.create({uri : file});

  var fileContents = fs.readFileSync(file, 'utf8');

  try { 
    resource.parse(fileContents, Ecore.XMI);
  } catch(err) {
    console.log('*** Failed parsing file: ' + file);
    console.trace(err);
    return;
  }

  var firstElement = resource.get('contents').first();
  if(firstElement.eClass.values.name === 'EPackage') {
    // This is an EPackage, so add it to the registry
    console.log("::: Adding to registry: " + firstElement.get('name'));
    Ecore.EPackage.Registry.register(firstElement);
    console.log("::: Display some model information");
    displayModelInfo(resource);
  }
	
  console.log("::: JSON Dump of " + file);
  console.log(util.inspect(resource.to(Ecore.JSON), false, null));
  
  console.log("::: XMI Dump of " + file);
  console.log(resource.to(Ecore.XMI, true));
}

//////////////////////////////////////////////////////////////////////////
//  Main Processing
//////////////////////////////////////////////////////////////////////////

for(var argidx = 2; argidx < process.argv.length; argidx++) {
  // Process each file that is passed on the command line
  var fileName = process.argv[argidx];
  console.log('::: Processing ' + fileName);
  processFile(fileName);
}
