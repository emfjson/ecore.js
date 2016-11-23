var Ecore = this.Ecore;
var assert = this.assert;

if (typeof require === 'function') {
    _ = require('underscore');
    Ecore = require('../dist/ecore.js');
    assert = require("assert");
}

describe('Ecore', function() {

    describe('#Ecore.EcorePackage', function() {

        it('should exist', function() {
            assert.ok(Ecore.EcorePackage);
            assert.strictEqual(Ecore.EcorePackage.eClass, Ecore.EPackage);
        });

        it('should contain EPackage attributes', function() {
            var nsURI = Ecore.EPackage.getEStructuralFeature('nsURI');
            assert.strictEqual(Ecore.EAttribute, nsURI.eClass);
        });

    });

    describe('#EModelElement', function() {
        var EModelElement = Ecore.EModelElement;

        it('should be abstract', function() {
            assert.ok(EModelElement);
            assert.equal(true, EModelElement.get('abstract'));
        });

        it('should have eAnnotations feature', function() {
            assert.equal(1, EModelElement.get('eStructuralFeatures').size());

            var eAnnotations = EModelElement.get('eStructuralFeatures').at(0);
            assert.equal('eAnnotations', eAnnotations.get('name'));
            assert.equal(Ecore.EReference, eAnnotations.eClass);
            assert.equal(0, eAnnotations.get('lowerBound'));
            assert.equal(-1, eAnnotations.get('upperBound'));
            assert.equal(true, eAnnotations.get('containment'));
        });

    });

    describe('#EAnnotation', function() {
        var EAnnotation = Ecore.EAnnotation;

        it('should exist', function() {
            assert.ok(EAnnotation);
            assert.equal(false, EAnnotation.get('abstract'));
        });

        it('should have source and details attributes', function() {
            var features = EAnnotation.get('eStructuralFeatures');
            assert.equal(2, features.size());

            var source = features.at(0);
            assert.equal('source', source.get('name'));
            assert.equal(0, source.get('lowerBound'));
            assert.equal(1, source.get('upperBound'));
            assert.strictEqual(Ecore.EAttribute, source.eClass);
            assert.equal(Ecore.EString, source.get('eType'));

            var details = features.at(1);
            assert.equal('details', details.get('name'));
            assert.equal(0, details.get('lowerBound'));
            assert.equal(-1, details.get('upperBound'));
            assert.strictEqual(Ecore.EReference, details.eClass);
            assert.strictEqual(Ecore.EStringToStringMapEntry, details.get('eType'));

            assert.ok(details.eClass.getEStructuralFeature);
        });

    });

    describe('#ENamedElement', function() {

        it('should be abstract', function() {
            var ENamedElement = Ecore.ENamedElement;
            assert.ok(ENamedElement);
            assert.strictEqual(true, ENamedElement.get('abstract'));
        });

        it('should contain ENamedElement attributes', function() {
            // name
            var name = Ecore.ENamedElement.getEStructuralFeature('name');

            assert.ok(name);
            assert.strictEqual(name.eClass, Ecore.EAttribute);
        });

    });

    describe('#ETypedElement', function() {

        it('should contain ETypedElement', function() {
            assert.ok(Ecore.ETypedElement);
            assert.strictEqual(Ecore.ETypedElement.eClass, Ecore.EClass);
        });

        it('should contain ETypedElement attributes', function() {
            // ordered
            var ordered = Ecore.ETypedElement.getEStructuralFeature('ordered');
            assert.ok(ordered);
            assert.strictEqual(ordered.eClass, Ecore.EAttribute);

            // unique
            var unique = Ecore.ETypedElement.getEStructuralFeature('unique');
            assert.ok(unique);
            assert.strictEqual(unique.eClass, Ecore.EAttribute);

            // lowerBound
            var lowerBound = Ecore.ETypedElement.getEStructuralFeature('lowerBound');
            assert.ok(lowerBound);
            assert.strictEqual(lowerBound.eClass, Ecore.EAttribute);

            // upperBound
            var upperBound = Ecore.ETypedElement.getEStructuralFeature('upperBound');
            assert.ok(upperBound);
            assert.strictEqual(upperBound.eClass, Ecore.EAttribute);

            // many
            var many = Ecore.ETypedElement.getEStructuralFeature('many');
            assert.ok(many);
            assert.strictEqual(many.eClass, Ecore.EAttribute);

            // required
            var required = Ecore.ETypedElement.getEStructuralFeature('required');
            assert.ok(required);
            assert.strictEqual(required.eClass, Ecore.EAttribute);
        });

        it('should contain ETypedElement references', function() {
            var eTypedElement = Ecore.ETypedElement;
            var eType = Ecore.ETypedElement.getEStructuralFeature('eType');

            // eType
            assert.ok(eType);
            assert.equal(eType.get('lowerBound'), 0);
            assert.equal(eType.get('upperBound'), 1);
            assert.strictEqual(eType.eClass, Ecore.EReference);
            assert.strictEqual(eType.get('eType'), Ecore.EClassifier);
        });

    });

    describe('#EPackage', function() {

        it('should contain EPackage', function() {
            assert.ok(Ecore.EPackage);
            assert.strictEqual(Ecore.EPackage.eClass, Ecore.EClass);
        });

        it('should contain EPackage attributes', function() {
            // nsURI
            var nsURI = Ecore.EPackage.getEStructuralFeature('nsURI');
            assert.ok(nsURI);
            assert.strictEqual(nsURI.eClass, Ecore.EAttribute);

            // nsPrefix
            var nsPrefix = Ecore.EPackage.getEStructuralFeature('nsPrefix');
            assert.ok(nsPrefix);
            assert.strictEqual(nsPrefix.eClass, Ecore.EAttribute);
        });

        it('should contain EPackage references', function() {
            var ePackage = Ecore.EPackage;

            // eClassifiers
            var eClassifiers = Ecore.EPackage.getEStructuralFeature('eClassifiers');
            assert.ok(eClassifiers);
            assert.equal(eClassifiers.get('lowerBound'), 0);
            assert.equal(eClassifiers.get('upperBound'), -1);
            assert.equal(eClassifiers.get('containment'), true);
            assert.strictEqual(eClassifiers.get('eType'), Ecore.EClassifier);

            // eSubPackages
            var eSubPackages = Ecore.EPackage.getEStructuralFeature('eSubPackages');
            assert.ok(eSubPackages);
            assert.equal(eSubPackages.get('lowerBound'), 0);
            assert.equal(eSubPackages.get('upperBound'), -1);
            assert.equal(eSubPackages.get('containment'), true);
            assert.strictEqual(eSubPackages.get('eType'), Ecore.EPackage);
        });

    });

    describe('#EClassifier', function() {

        it('should contain EClassifier', function() {
            assert.ok(Ecore.EClassifier);
            assert.strictEqual(Ecore.EClassifier.eClass, Ecore.EClass);
        });

    });

    describe('#EClass', function() {

        it('should contain EClass', function() {
            assert.ok(Ecore.EClass);
            assert.strictEqual(Ecore.EClass.eClass, Ecore.EClass);
        });

        it('should contain EClass attributes', function() {
             var eClass = Ecore.EClass;

            // abstract
            var _abstract = Ecore.EClass.getEStructuralFeature('abstract');
            assert.ok(_abstract);
            assert.strictEqual(_abstract.eClass, Ecore.EAttribute);

            // interface
            var _interface = Ecore.EClass.getEStructuralFeature('interface');
            assert.ok(_interface);
            assert.strictEqual(_interface.eClass, Ecore.EAttribute);
        });

        it('should contain EClass references', function() {
            var eClass = Ecore.EClass;
            // eStructuralFeatures
            var eStructuralFeatures = Ecore.EClass.getEStructuralFeature('eStructuralFeatures');
            assert.ok(eStructuralFeatures);
            assert.equal(eStructuralFeatures.get('lowerBound'), 0);
            assert.equal(eStructuralFeatures.get('upperBound'), -1);
            assert.equal(eStructuralFeatures.get('containment'), true);
            assert.strictEqual(eStructuralFeatures.get('eType'), Ecore.EStructuralFeature);

            var eSuperTypes = Ecore.EClass.getEStructuralFeature('eSuperTypes');
            assert.ok(eSuperTypes);
            assert.equal(eSuperTypes.get('lowerBound'), 0);
            assert.equal(eSuperTypes.get('upperBound'), -1);
            assert.strictEqual(eSuperTypes.get('many'), true);
            assert.equal(eSuperTypes.get('containment'), false);
            assert.strictEqual(eSuperTypes.get('eType'), Ecore.EClass);


            var eOperations = Ecore.EClass.getEStructuralFeature('eOperations');
            assert.ok(eOperations);
            assert.equal(eOperations.get('lowerBound'), 0);
            assert.equal(eOperations.get('upperBound'), -1);
            assert.equal(eOperations.get('containment'), true);
            assert.strictEqual(eOperations.get('eType'), Ecore.EOperation);

        });
    }); // end EClass

    describe('#EDataType', function() {

        it('should contain EDataType', function() {
            assert.ok(Ecore.EDataType);
            assert.strictEqual(Ecore.EDataType.eClass, Ecore.EClass);
        });

    }); // end EDataType

    describe('#EStructuralFeature', function() {

        it('should contain EStructuralFeature', function() {
            assert.ok(Ecore.EStructuralFeature);
            assert.strictEqual(Ecore.EStructuralFeature.eClass, Ecore.EClass);
        });

        it('should contain EStructuralFeature attributes', function() {
            // changeable
            var changeable = Ecore.EStructuralFeature.getEStructuralFeature('changeable');
            assert.ok(changeable);
            assert.strictEqual(changeable.eClass, Ecore.EAttribute);

            // volatile
            var _volatile = Ecore.EStructuralFeature.getEStructuralFeature('volatile');
            assert.ok(_volatile);
            assert.strictEqual(_volatile.eClass, Ecore.EAttribute);

            // transient
            var _transient = Ecore.EStructuralFeature.getEStructuralFeature('transient');
            assert.ok(_transient);
            assert.strictEqual(_transient.eClass, Ecore.EAttribute);

            // defaultValueLiteral
            var defaultValueLiteral = Ecore.EStructuralFeature.getEStructuralFeature('defaultValueLiteral');
            assert.ok(defaultValueLiteral);
            assert.strictEqual(defaultValueLiteral.eClass, Ecore.EAttribute);

            // defaultValue
            var defaultValue = Ecore.EStructuralFeature.getEStructuralFeature('defaultValue');
            assert.ok(defaultValue);
            assert.strictEqual(defaultValue.eClass, Ecore.EAttribute);

            // unsettable
            var unsettable = Ecore.EStructuralFeature.getEStructuralFeature('unsettable');
            assert.ok(unsettable);
            assert.strictEqual(unsettable.eClass, Ecore.EAttribute);

            // derived
            var derived = Ecore.EStructuralFeature.getEStructuralFeature('derived');
            assert.ok(derived);
            assert.strictEqual(derived.eClass, Ecore.EAttribute);
        });
    }); // end EStructuralFeature

    describe('#EAttribute', function() {

        it('should contain EAttribute', function() {
            assert.ok(Ecore.EAttribute);
            assert.strictEqual(Ecore.EAttribute.eClass, Ecore.EClass);
        });

        it('should contain EAttribute attributes', function() {
            // iD
            var iD = Ecore.EAttribute.getEStructuralFeature('iD');
            assert.ok(iD);
            assert.strictEqual(iD.eClass, Ecore.EAttribute);
        });

    }); // end EAttribute

    describe('#EReference', function() {

        it('should contain EReference', function() {
            assert.ok(Ecore.EReference);
            assert.strictEqual(Ecore.EReference.eClass, Ecore.EClass);
        });

        it('should contain EReference attributes', function() {
            // isContainment
            var isContainment = Ecore.EReference.getEStructuralFeature('containment');
            assert.ok(isContainment);
            assert.strictEqual(isContainment.eClass, Ecore.EAttribute);

            // container
            var container = Ecore.EReference.getEStructuralFeature('container');
            assert.ok(container);
            assert.strictEqual(container.eClass, Ecore.EAttribute);

            // resolveProxies
            var resolveProxies = Ecore.EReference.getEStructuralFeature('resolveProxies');
            assert.ok(resolveProxies);
            assert.strictEqual(resolveProxies.eClass, Ecore.EAttribute);
        });

        it('should contain EReference references', function() {
            var eReference = Ecore.EReference;
            // eOpposite
            var eOpposite = Ecore.EReference.getEStructuralFeature('eOpposite');

            assert.ok(eOpposite);
            assert.equal(eOpposite.get('lowerBound'), 0);
            assert.equal(eOpposite.get('upperBound'), 1);
            assert.equal(eOpposite.get('eType'), eReference);
        });

    }); // end EReference

    describe('#EOperation', function() {

        it('should contain EOperation', function() {
            assert.ok(Ecore.EOperation);
            assert.strictEqual(Ecore.EOperation.eClass, Ecore.EClass);
        });

        it('should contain EOperation references', function() {
            var eParameters = Ecore.EOperation.getEStructuralFeature('eParameters');
            assert.strictEqual(Ecore.EReference, eParameters.eClass);
            assert.strictEqual(true, eParameters.get('containment'));
            assert.strictEqual(eParameters.get('lowerBound'), 0);
            assert.strictEqual(eParameters.get('upperBound'), -1);
            assert.strictEqual(eParameters.get('eType'), Ecore.EParameter);

            var eTypeParameters = Ecore.EOperation.getEStructuralFeature('eTypeParameters');
            assert.strictEqual(Ecore.EReference, eTypeParameters.eClass);
            assert.strictEqual(true, eTypeParameters.get('containment'));
            assert.strictEqual(eTypeParameters.get('lowerBound'), 0);
            assert.strictEqual(eTypeParameters.get('upperBound'), -1);
            assert.strictEqual(eTypeParameters.get('eType'), Ecore.ETypeParameter);

            var eGenericExceptions = Ecore.EOperation.getEStructuralFeature('eGenericExceptions');
            assert.strictEqual(Ecore.EReference, eGenericExceptions.eClass);
            assert.strictEqual(true, eGenericExceptions.get('containment'));
            assert.strictEqual(eGenericExceptions.get('lowerBound'), 0);
            assert.strictEqual(eGenericExceptions.get('upperBound'), -1);
            assert.strictEqual(eGenericExceptions.get('eType'), Ecore.EGenericType);
        });

    }); // end EOperation

    describe('#EParameter', function() {

        it('should contain EParameter', function() {
            assert.ok(Ecore.EParameter);
            assert.strictEqual(Ecore.EParameter.eClass, Ecore.EClass);
        });

    }); // end EParameter

    describe('#EModelElement', function() {
        var EModelElement = Ecore.EModelElement;

        it('should have correct attributes', function() {
            assert.equal(EModelElement.get('abstract'), true);
            assert.equal(EModelElement.get('eSuperTypes').size(), 1);
        });

    }); // end describe EModelElement

    describe('#ENamedElement', function() {
        var ENamedElement = Ecore.ENamedElement;

        it('should have correct attributes', function() {
            assert.equal(ENamedElement.get('abstract'), true);
            assert.equal(ENamedElement.get('eSuperTypes').size(), 1);

            var superType = ENamedElement.get('eSuperTypes').first();

            assert.strictEqual(superType, Ecore.EModelElement);
        });
    }); // end describe ENamedElement

    describe('#ETypedElement', function() {
        var ETypedElement = Ecore.ETypedElement;

        it('should have correct attributes', function() {
            assert.equal(ETypedElement.get('abstract'), true);
            assert.equal(ETypedElement.get('eSuperTypes').size(), 1);

            var superType = ETypedElement.get('eSuperTypes').first();

            assert.strictEqual(superType, Ecore.ENamedElement);

            var allSuperTypes = ETypedElement.get('eAllSuperTypes');

            assert.equal(allSuperTypes.length, 3);
            assert.ok(_.contains(allSuperTypes, Ecore.ENamedElement));
            assert.ok(_.contains(allSuperTypes, Ecore.EModelElement));
        });

        it('should have correct features', function() {
            var eGenericType = ETypedElement.getEStructuralFeature("eGenericType");
            assert.strictEqual(Ecore.EReference, eGenericType.eClass);
            assert.strictEqual(Ecore.EGenericType, eGenericType.get('eType'));
            assert.strictEqual(true, eGenericType.get('containment'));
            assert.strictEqual(1, eGenericType.get('upperBound'));
        });

    }); // end describe ETypedElement

    describe('#EClassifier', function() {
        var EClassifier = Ecore.EClassifier;

        it('should have correct attributes', function() {
            assert.equal(EClassifier.get('abstract'), true);
            assert.equal(EClassifier.get('eSuperTypes').size(), 1);
        });

        it('should have correct features', function() {
            var eTypeParameters = EClassifier.getEStructuralFeature("eTypeParameters");
            assert.strictEqual(Ecore.EReference, eTypeParameters.eClass);
            assert.strictEqual(Ecore.ETypeParameter, eTypeParameters.get('eType'));
            assert.strictEqual(true, eTypeParameters.get('containment'));
            assert.strictEqual(-1, eTypeParameters.get('upperBound'));
        });

    }); // end describe EClassifier

    describe('#EClass', function() {
        var EClass = Ecore.EClass;

        it('should have correct attributes', function() {
            assert.strictEqual(EClass, EClass.eClass);

            var abstract = EClass.getEStructuralFeature("abstract");
            assert.strictEqual(Ecore.EAttribute, abstract.eClass);
            assert.strictEqual(Ecore.EBoolean, abstract.get('eType'));
            assert.strictEqual(1, abstract.get('upperBound'));

            var interface_ = EClass.getEStructuralFeature("interface");
            assert.strictEqual(Ecore.EAttribute, interface_.eClass);
            assert.strictEqual(Ecore.EBoolean, interface_.get('eType'));
            assert.strictEqual(1, interface_.get('upperBound'));
        });

        it('should have correct references', function() {
            var eSuperTypes = EClass.getEStructuralFeature("eSuperTypes");
            assert.strictEqual(Ecore.EReference, eSuperTypes.eClass);
            assert.strictEqual(Ecore.EClass, eSuperTypes.get('eType'));
            assert.notEqual(true, eSuperTypes.get('containment'));
            assert.strictEqual(-1, eSuperTypes.get('upperBound'));

            var eStructuralFeatures = EClass.getEStructuralFeature("eStructuralFeatures");
            assert.strictEqual(Ecore.EReference, eStructuralFeatures.eClass);
            assert.strictEqual(Ecore.EStructuralFeature, eStructuralFeatures.get('eType'));
            assert.strictEqual(true, eStructuralFeatures.get('containment'));
            assert.strictEqual(-1, eStructuralFeatures.get('upperBound'));

            var eOperations = EClass.getEStructuralFeature("eOperations");
            assert.strictEqual(Ecore.EReference, eOperations.eClass);
            assert.strictEqual(Ecore.EOperation, eOperations.get('eType'));
            assert.strictEqual(true, eOperations.get('containment'));
            assert.strictEqual(-1, eOperations.get('upperBound'));

            var eGenericSuperTypes = EClass.getEStructuralFeature("eGenericSuperTypes");
            assert.strictEqual(Ecore.EReference, eGenericSuperTypes.eClass);
            assert.strictEqual(Ecore.EGenericType, eGenericSuperTypes.get('eType'));
            assert.strictEqual(true, eGenericSuperTypes.get('containment'));
            assert.strictEqual(-1, eGenericSuperTypes.get('upperBound'));
        });

        it('should have EClassifier has eSuperTypes', function() {
            var EClassifier = Ecore.EClassifier;
            var found = EClass.get('eSuperTypes').find(function(type) {
                return type === EClassifier;
            });

            assert.ok(found);
            assert.strictEqual(found, EClassifier);
        });

    });  // end describe EClass.

    describe('ETypeParameter', function() {
        var ETypeParameter = Ecore.ETypeParameter;

        it('should have correct attributes', function() {
            assert.strictEqual(0, ETypeParameter.get('eAttributes').length);
            assert.strictEqual(1, ETypeParameter.get('eSuperTypes').size());
            assert.ok(ETypeParameter.get('eSuperTypes').contains(Ecore.ENamedElement));
        });

        it('should have correct references', function() {
            var eReferences = ETypeParameter.get('eReferences');

            assert.strictEqual(2, eReferences.length);

            var eGenericTypes = ETypeParameter.getEStructuralFeature('eGenericTypes');
            assert.strictEqual(Ecore.EGenericType, eGenericTypes.get('eType'));
            assert.notEqual(true, eGenericTypes.get('containment'));
            assert.strictEqual(-1, eGenericTypes.get('upperBound'));

            var eBounds = ETypeParameter.getEStructuralFeature('eBounds');
            assert.strictEqual(Ecore.EGenericType, eBounds.get('eType'));
            assert.strictEqual(true, eBounds.get('containment'));
            assert.strictEqual(-1, eBounds.get('upperBound'));
        });
    });

    describe('EGenericType', function() {
        var EGenericType = Ecore.EGenericType;

        it('should have correct attributes', function() {
            assert.strictEqual(0, EGenericType.get('eAttributes').length);
            assert.strictEqual(1, EGenericType.get('eSuperTypes').size());
        });

        it('should have correct references', function() {
            assert.strictEqual(5, EGenericType.get('eReferences').length);

            var eUpperBound = EGenericType.getEStructuralFeature('eUpperBound');
            assert.strictEqual(EGenericType, eUpperBound.get('eType'));
            assert.strictEqual(1, eUpperBound.get('upperBound'));
            assert.strictEqual(true, eUpperBound.get('containment'));

            var eLowerBound = EGenericType.getEStructuralFeature('eLowerBound');
            assert.strictEqual(EGenericType, eLowerBound.get('eType'));
            assert.strictEqual(1, eLowerBound.get('upperBound'));
            assert.strictEqual(true, eLowerBound.get('containment'));

            var eTypeArguments = EGenericType.getEStructuralFeature('eTypeArguments');
            assert.strictEqual(EGenericType, eTypeArguments.get('eType'));
            assert.strictEqual(-1, eTypeArguments.get('upperBound'));
            assert.strictEqual(true, eTypeArguments.get('containment'));

            var eTypeParameter = EGenericType.getEStructuralFeature('eTypeParameter');
            assert.strictEqual(Ecore.ETypeParameter, eTypeParameter.get('eType'));
            assert.strictEqual(1, eTypeParameter.get('upperBound'));
            assert.notEqual(true, eTypeParameter.get('containment'));

            var eClassifier = EGenericType.getEStructuralFeature('eClassifier');
            assert.strictEqual(Ecore.EClassifier, eClassifier.get('eType'));
            assert.strictEqual(1, eClassifier.get('upperBound'));
            assert.notEqual(true, eClassifier.get('containment'));
        })
    });

}); // end describe Ecore.

