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

    describe('#elements', function() {

        it('should return all elements in the resourceSet if no parameter', function() {
            var resourceSet = Ecore.ResourceSet.create();
            var r = resourceSet.create({ uri: 'test' });
            var P = Ecore.EPackage.create({ name: 'P', nsURI: 'test', nsPrefix: 'P' });
            var A = Ecore.EClass.create({ name: 'A' });
            var B = Ecore.EClass.create({ name: 'B' });
            B.get('eSuperTypes').add(A);
            P.get('eClassifiers').add(A).add(B);
            r.get('contents').add(P);
            var r2 = resourceSet.create({ uri: 'test-instance' });
            var a1 = A.create();
            var a2 = A.create();
            var b1 = B.create();
            r2.get('contents').add(a1).add(a2).add(b1);

            var elements = resourceSet.elements();
            assert.ok(elements);
            assert.strictEqual(6, elements.length);
        });

        it('should return all elements that are of type provided as parameter', function() {
            var resourceSet = Ecore.ResourceSet.create();
            var r = resourceSet.create({ uri: 'test' });
            var P = Ecore.EPackage.create({ name: 'P', nsURI: 'test', nsPrefix: 'P' });
            var A = Ecore.EClass.create({ name: 'A' });
            var B = Ecore.EClass.create({ name: 'B' });
            B.get('eSuperTypes').add(A);
            P.get('eClassifiers').add(A).add(B);
            r.get('contents').add(P);
            var r2 = resourceSet.create({ uri: 'test-instance' });
            var a1 = A.create();
            var a2 = A.create();
            var b1 = B.create();
            r2.get('contents').add(a1).add(a2).add(b1);

            var elementsEClass = resourceSet.elements('EClass');
            assert.ok(elementsEClass);
            assert.strictEqual(2, elementsEClass.length);

            var elementsA = resourceSet.elements('A');
            assert.ok(elementsA);
            assert.strictEqual(3, elementsA.length);

            var elementsB = resourceSet.elements('B');
            assert.ok(elementsB);
            assert.strictEqual(1, elementsB.length);
        });

    });

    describe('#uriConverter', function() {

        it('should return unique URIConverter per resourceSet', function() {
            var resourceSet = Ecore.ResourceSet.create();
            var c1 = resourceSet.uriConverter();
            var c2 = resourceSet.uriConverter();

            assert.strictEqual(c1, c2);
        });

        it('should work on full uris', function() {
            var resourceSet = Ecore.ResourceSet.create();
            var converter = resourceSet.uriConverter();
            converter.map('http://www.example.org/sample', 'http://www.another.org/sample');

            var normalized = converter.normalize('http://www.example.org/sample');
            assert.strictEqual('http://www.another.org/sample', normalized);
        });

        it('should work on uri with fragment', function() {
            var resourceSet = Ecore.ResourceSet.create();
            var converter = resourceSet.uriConverter();
            converter.map('http://www.example.org/sample', 'http://www.another.org/sample');

            var normalized = converter.normalize('http://www.example.org/sample#frag?q=query');
            assert.strictEqual('http://www.another.org/sample', normalized);
        });

        it('should work on uri with fragment', function() {
            var resourceSet = Ecore.ResourceSet.create();
            var converter = resourceSet.uriConverter();
            var normalized = converter.normalize('http://www.example.org/sample');
            assert.strictEqual('http://www.example.org/sample', normalized);
        });

        it('should work on uri starting with slash', function() {
            var resourceSet = Ecore.ResourceSet.create();
            var converter = resourceSet.uriConverter();
            var normalized = converter.normalize('/sample');

            assert.strictEqual('/sample', normalized);

            converter.map('/models/', 'http://www.example.org/models/');
            normalized = converter.normalize('/models/sample');
            assert.strictEqual('http://www.example.org/models/sample', normalized);
        });

        it('should work on uri with no slashes', function() {
            var resourceSet = Ecore.ResourceSet.create();
            var converter = resourceSet.uriConverter();
            var normalized = converter.normalize('sample');
            assert.strictEqual('sample', normalized);
        });

        it('should work on uris with missing segments', function() {
            var resourceSet = Ecore.ResourceSet.create();
            var converter = resourceSet.uriConverter();
            converter.map('http://www.example.org/', 'http://www.another.org/');

            var normalized = converter.normalize('http://www.example.org/sample');
            assert.strictEqual('http://www.another.org/sample', normalized);
        });

    });

});

