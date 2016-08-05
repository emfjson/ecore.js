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
function processFile(file) {

  var resource = resourceSet.create({uri : file});

  var fileContents = fs.readFileSync(file, 'utf8');

  if (catchError) {
    try { 
      resource.parse(fileContents, Ecore.XMI);
    } catch(err) {
      console.log('*** Failed parsing file: ' + file);
      console.trace(err);
      return;
    }
  } else {
    resource.parse(fileContents, Ecore.XMI);
  }

  var firstElement = resource.get('contents').first();
  if(firstElement.eClass.values.name === 'EPackage') {
    // This is an EPackage, so add it to the registry
    console.log("::: Adding to registry: " + firstElement.get('name'));
    Ecore.EPackage.Registry.register(firstElement);
  }

  if (showJSON) {
    console.log("::: JSON Dump of " + file);
    console.log(util.inspect(resource.to(Ecore.JSON), false, null));
  }
  
  if (showXMI) {
    console.log("::: XMI Dump of " + file);
    console.log(resource.to(Ecore.XMI, true));
  }

}

//////////////////////////////////////////////////////////////////////////
//  Main Processing
//////////////////////////////////////////////////////////////////////////

var showJSON = false;
var showXMI = false;
var showModel = false;
var catchError = false;

for(var argidx = 2; argidx < process.argv.length; argidx++) {
  // Process each file that is passed on the command line
  var argument = process.argv[argidx];

  if (argument === "-showJSON") {
    showJSON = !showJSON;
  } else if (argument === "-showXMI") {
    showXMI = !showXMI;
  } else if (argument === "-catchError") {
    catchError = !catchError;
  } else {
    var fileName = argument;
    console.log('::: Processing ' + fileName);
    processFile(fileName);
  }
}
