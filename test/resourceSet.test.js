fs = require('fs');
var Ecore = require('../dist/ecore.js');
var assert = require("assert");

describe('ResourceSet', function() {

    describe('#constructor', function() {

        it('should instantiate a ResourceSet correctly', function() {
            var resourceSet = Ecore.ResourceSet.create();

            assert.ok(resourceSet);
            assert.strictEqual(Ecore.ResourceSet, resourceSet.eClass);
            assert.ok(resourceSet.isTypeOf('ResourceSet'));
            assert.ok(resourceSet.isTypeOf(Ecore.ResourceSet));
        });

    });

    describe('#create', function() {

        it('should return a new instance of Resource', function() {
            var resourceSet = Ecore.ResourceSet.create();
            var resource = resourceSet.create('res1');

            assert.ok(resource);
            assert.strictEqual(Ecore.Resource, resource.eClass);

            var resource2 = resourceSet.create({ uri: 'res2' });
            assert.ok(resource2);
            assert.strictEqual(Ecore.Resource, resource2.eClass);
        });

        it('should return Resource if Resource already created', function() {
            var resourceSet = Ecore.ResourceSet.create();
            var resource = resourceSet.create('res1');

            assert.ok(resource);
            assert.strictEqual(Ecore.Resource, resource.eClass);

            var resource2 = resourceSet.create({ uri: 'res1' });
            assert.strictEqual(resource, resource2);
        });

        it('should add the resource to the list of resources', function() {
            var resourceSet = Ecore.ResourceSet.create();
            assert.strictEqual(0, resourceSet.get('resources').size());

            var resource = resourceSet.create('res1');
            assert.strictEqual(1, resourceSet.get('resources').size());
            assert.strictEqual(resource, resourceSet.get('resources').at(0));
        });

    });

});

