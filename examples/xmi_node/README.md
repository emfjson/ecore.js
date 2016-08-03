# XMI Node Example 
This example includes the loading of the ecore file and then loading 
two sample files built with that EMF model.

The EMF Model is found in TestModel.ecore.  Note that this file is an XMI formated file.

The test1.testmodel file conforms to the TestModel ecore file format and includes a reflexive relationship with subclasses.  Note that the parent Item is not abstract.

The test2.testmodel file conforms to the TestModel ecore file format and includes a simple composite structure that is nested two classes deep.

## To run with only the ecore type:

node simpleTest.js TestModel.ecore

## To run with the ecore and the first test model type: 

node simpleTest.js TestModel.ecore test1.testmodel

## To run with the ecore and the second test model type: 

node simpleTest.js TestModel.ecore test2.testmodel 

## To run with the ecore and both test models type: 

node simpleTest.js TestModel.ecore test1.testmodel test2.testmodel

## To run with the ecore and instances with references in a common resource set type:

node simpleTest.js TestModel.ecore test3a.testmodel test3b.testmodel test3c.testmodel 

## To run with with attributes as an XMI element type:

node simpleTest.js TestModel.ecore test4a.testmodel test4b.testmodel

