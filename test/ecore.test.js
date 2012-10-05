var Ecore = require('../dist/ecore.js');
var assert = require("assert");

describe('Ecore', function() {

    describe('#EcorePackage', function() {

        var EcorePackage = Ecore.EcorePackage;

        it('should exist', function() {
            assert.ok(EcorePackage);
            assert.strictEqual(EcorePackage.eClass, EcorePackage.EPackage);
        });

        it('should contain EModelElement', function() {
            assert.ok(EcorePackage.EModelElement);
            assert.strictEqual(EcorePackage.EModelElement.eClass, EcorePackage.EClass);
        });

        it('should contain ENamedElement', function() {
            assert.ok(EcorePackage.ENamedElement);
            assert.strictEqual(EcorePackage.ENamedElement.eClass, EcorePackage.EClass);
        });

        it('should contain ENamedElement attributes', function() {
            // name
            var name = EcorePackage.ENamedElement_name;

            assert.ok(name);
            assert.strictEqual(name.eClass, EcorePackage.EAttribute);
        });

        it('should contain ETypedElement', function() {
            assert.ok(EcorePackage.ETypedElement);
            assert.strictEqual(EcorePackage.ETypedElement.eClass, EcorePackage.EClass);
        });

        it('should contain ETypedElement attributes', function() {
            // ordered
            var ordered = EcorePackage.ETypedElement_ordered;
            assert.ok(ordered);
            assert.strictEqual(ordered.eClass, EcorePackage.EAttribute);

            // unique
            var unique = EcorePackage.ETypedElement_unique;
            assert.ok(unique);
            assert.strictEqual(unique.eClass, EcorePackage.EAttribute);

            // lowerBound
            var lowerBound = EcorePackage.ETypedElement_lowerBound;
            assert.ok(lowerBound);
            assert.strictEqual(lowerBound.eClass, EcorePackage.EAttribute);

            // upperBound
            var upperBound = EcorePackage.ETypedElement_upperBound;
            assert.ok(upperBound);
            assert.strictEqual(upperBound.eClass, EcorePackage.EAttribute);

            // many
            var many = EcorePackage.ETypedElement_many;
            assert.ok(many);
            assert.strictEqual(many.eClass, EcorePackage.EAttribute);

            // required
            var required = EcorePackage.ETypedElement_required;
            assert.ok(required);
            assert.strictEqual(required.eClass, EcorePackage.EAttribute);
        });

        it('should contain EPackage', function() {
            assert.ok(EcorePackage.EPackage);
            assert.strictEqual(EcorePackage.EPackage.eClass, EcorePackage.EClass);
        });

        it('should contain EPackage attributes', function() {
            // nsURI
            var nsURI = EcorePackage.EPackage_nsURI;
            assert.ok(nsURI);
            assert.strictEqual(nsURI.eClass, EcorePackage.EAttribute);

            // nsPrefix
            var nsPrefix = EcorePackage.EPackage_nsPrefix;
            assert.ok(nsPrefix);
            assert.strictEqual(nsPrefix.eClass, EcorePackage.EAttribute);
        });

        it('should contain EClassifier', function() {
            assert.ok(EcorePackage.EClassifier);
            assert.strictEqual(EcorePackage.EClassifier.eClass, EcorePackage.EClass);
        });

        it('should contain EClass', function() {
            assert.ok(EcorePackage.EClass);
            assert.strictEqual(EcorePackage.EClass.eClass, EcorePackage.EClass);
        });

        it('should contain EClass attributes', function() {
            // abstract
            var abstract = EcorePackage.EClass_abstract;
            assert.ok(abstract);
            assert.strictEqual(abstract.eClass, EcorePackage.EAttribute);

            // interface
            var interface = EcorePackage.EClass_interface;
            assert.ok(interface);
            assert.strictEqual(interface.eClass, EcorePackage.EAttribute);
        });

        it('should contain EDataType', function() {
            assert.ok(EcorePackage.EDataType);
            assert.strictEqual(EcorePackage.EDataType.eClass, EcorePackage.EClass);
        });

        it('should contain EStructuralFeature', function() {
            assert.ok(EcorePackage.EStructuralFeature);
            assert.strictEqual(EcorePackage.EStructuralFeature.eClass, EcorePackage.EClass);
        });

        it('should contain EStructuralFeature attributes', function() {
            // changeable
            var changeable = EcorePackage.EStructuralFeature_changeable;
            assert.ok(changeable);
            assert.strictEqual(changeable.eClass, EcorePackage.EAttribute);

            // volatile
            var volatile = EcorePackage.EStructuralFeature_volatile;
            assert.ok(volatile);
            assert.strictEqual(volatile.eClass, EcorePackage.EAttribute);

            // transient
            var transient = EcorePackage.EStructuralFeature_transient;
            assert.ok(transient);
            assert.strictEqual(transient.eClass, EcorePackage.EAttribute);

            // defaultValueLiteral
            var defaultValueLiteral = EcorePackage.EStructuralFeature_defaultValueLiteral;
            assert.ok(defaultValueLiteral);
            assert.strictEqual(defaultValueLiteral.eClass, EcorePackage.EAttribute);

            // defaultValue
            var defaultValue = EcorePackage.EStructuralFeature_defaultValue;
            assert.ok(defaultValue);
            assert.strictEqual(defaultValue.eClass, EcorePackage.EAttribute);

            // unsettable
            var unsettable = EcorePackage.EStructuralFeature_unsettable;
            assert.ok(unsettable);
            assert.strictEqual(unsettable.eClass, EcorePackage.EAttribute);

            // derived
            var derived = EcorePackage.EStructuralFeature_derived;
            assert.ok(derived);
            assert.strictEqual(derived.eClass, EcorePackage.EAttribute);
        });

        it('should contain EAttribute', function() {
            assert.ok(EcorePackage.EAttribute);
            assert.strictEqual(EcorePackage.EAttribute.eClass, EcorePackage.EClass);
        });

        it('should contain EAttribute attributes', function() {
            // iD
            var iD = EcorePackage.EAttribute_iD;
            assert.ok(iD);
            assert.strictEqual(iD.eClass, EcorePackage.EAttribute);
        });

        it('should contain EReference', function() {
            assert.ok(EcorePackage.EReference);
            assert.strictEqual(EcorePackage.EReference.eClass, EcorePackage.EClass);
        });

        it('should contain EReference attributes', function() {
            // isContainment
            var isContainment = EcorePackage.EReference_isContainment;
            assert.ok(isContainment);
            assert.strictEqual(isContainment.eClass, EcorePackage.EAttribute);

            // container
            var container = EcorePackage.EReference_container;
            assert.ok(container);
            assert.strictEqual(container.eClass, EcorePackage.EAttribute);

            // resolveProxies
            var resolveProxies = EcorePackage.EReference_resolveProxies;
            assert.ok(resolveProxies);
            assert.strictEqual(resolveProxies.eClass, EcorePackage.EAttribute);
        });

        it('should contain EOperation', function() {
            assert.ok(EcorePackage.EOperation);
            assert.strictEqual(EcorePackage.EOperation.eClass, EcorePackage.EClass);
        });

        it('should contain EParameter', function() {
            assert.ok(EcorePackage.EParameter);
            assert.strictEqual(EcorePackage.EParameter.eClass, EcorePackage.EClass);
        });

        it('should contain EFactory', function() {
            assert.ok(EcorePackage.EFactory);
            assert.strictEqual(EcorePackage.EFactory.eClass, EcorePackage.EClass);
        });


        describe('#EModelElement', function() {
            var EModelElement = EcorePackage.EModelElement;

            it('should have correct attributes', function() {
                assert.equal(EModelElement.get('abstract'), true);
                assert.equal(EModelElement.get('eSuperTypes').size(), 0);
            });
        }); // end describe EModelElement

        describe('#ENamedElement', function() {
            var ENamedElement = EcorePackage.ENamedElement;

            it('should have correct attributes', function() {
                assert.equal(ENamedElement.get('abstract'), true);
                assert.equal(ENamedElement.get('eSuperTypes').size(), 1);

                var superType = ENamedElement.get('eSuperTypes').first();

                assert.strictEqual(superType, EcorePackage.EModelElement);
            });
        }); // end describe ENamedElement

        describe('#ETypedElement', function() {
            var ETypedElement = EcorePackage.ETypedElement;

            it('should have correct attributes', function() {
                assert.equal(ETypedElement.get('abstract'), true);
                assert.equal(ETypedElement.get('eSuperTypes').size(), 1);

                var superType = ETypedElement.get('eSuperTypes').first();

                assert.strictEqual(superType, EcorePackage.ENamedElement);

                var allSuperTypes = ETypedElement.eAllSuperTypes();

                assert.equal(allSuperTypes.length, 2);
                assert.ok(_.contains(allSuperTypes, EcorePackage.ENamedElement));
                assert.ok(_.contains(allSuperTypes, EcorePackage.EModelElement));
            });
        }); // end describe ETypedElement

        describe('#EClassifier', function() {
            var EClassifier = EcorePackage.EClassifier;

            it('should have correct attributes', function() {
                assert.equal(EClassifier.get('abstract'), true);
                assert.equal(EClassifier.get('eSuperTypes').size(), 1);
            });
        }); // end describe EClassifier

        describe('#EClass', function() {
            var EClass = EcorePackage.EClass;

            it('should have correct attributes', function() {
                assert.strictEqual(EClass, EClass.eClass);

                var eFeatures = EClass.eAllStructuralFeatures();

                var found = _.find(eFeatures, function(feature) {
                    return feature.get('name') === 'name';
                });

                assert.ok(found);
                assert.strictEqual(found.eClass, EcorePackage.EAttribute);
            });

            it('should have EClassifier has eSuperTypes', function() {
                var EClassifier = EcorePackage.EClassifier;
                var found = EClass.get('eSuperTypes').find(function(type) {
                    return type === EClassifier;
                });

                assert.ok(found);
                assert.strictEqual(found, EClassifier);
            });
        });  // end describe EClass.

    }); // end describe EcorePackage.

});