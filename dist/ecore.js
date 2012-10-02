(function() {

var Ecore = {

    create: function(eClass) {
        if (!eClass.eClass) {
            throw new Error('Cannot create EObject from undefined EClass');
        }

        return new Ecore.EObject({ eClass: eClass });
    }

};

Ecore.VERSION = '0.1.0';

// The root object, `window` in the browser, or `global` on the server.
var root = this;

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Ecore;
    }
    exports.Ecore = Ecore;
} else {
    root['Ecore'] = Ecore;
}

function getFragment(eModelElement) {
    var eContainer = eModelElement.eContainer;

    if (!eContainer || eContainer instanceof Ecore.Model) {
        return '/'
    } else {
        return getFragment(eContainer) + '/' + eModelElement.get('name');
    }
};

var EObjectPrototype = {

    has: function(name) {
        return this.values.hasOwnProperty(name) || this._isStructuralFeature(name);
    },

    set: function(name, value) {
        if (this.has(name)) {
            this.values[name] = value;
        }

        return this;
    },

    get: function(name) {
        var value;
        if (this.has(name)) {
            value = this.values[name];
        }

        return value;
    },

    isTypeOf: function(type) {
        return this.eClass.get('name') === type;
    },

    isKindOf: function(type) {
        var eClass = this.eClass;
        if (eClass) {
            return _.any(eClass.eAllSuperTypes(), function(eSuper) {
                return eSuper.get('name') === type;
            });
        }
        return false;
    },

    uri: function() {
        if (this.eContainer instanceof Ecore.Model) {
            return this.eContainer.uri + '#' + '/';
        } else {

        }
    },

    eURIFragmentSegment: function(feature, parentIndex, position) {
        if (this.isKindOf('EModelElement')) {

            return getFragment(this);

        } else {

            var eClass = this.eClass;
            var iD = eClass.get('eIDAttribute');
            var _idx;

            if (iD) {
                _idx = val.get(iD.name);
            } else {
                _idx = parentIndex + '/@' + feature.name;
                if (position > -1) {
                    _idx += '.' + position;
                }
            }

            return _idx;
        }
    },

    // private

    _getDefaultAttributeValue: function(eFeature) {
        var eType = eFeature.get('eType'),
            eFeatureUpperBound = eFeature.get('upperBound');

        if (!eFeatureUpperBound) {
            return null;
        }

        if (eFeatureUpperBound === 1) {
            if (eType) {
                switch(eType.get('name')) {
                    case 'EString':
                        return '';
                        break;
                    case 'EBoolean':
                        return false;
                        break;
                    case 'EInteger':
                        return 0;
                        break;
                    default:
                        return '';
                        break;
                }
            } else {
                return null;
            }
        } else {
            return [];
        }
    },

    _getDefaultReferenceValue: function(eFeature) {
        var eFeatureUpperBound = eFeature.get('upperBound');
        if (!eFeatureUpperBound) {
            return null;
        }

        if (eFeatureUpperBound === 1) {
            return null;
        } else {
            return new EList(this, eFeature);
        }
    },

    _initFeature: function(eFeature) {
        var eFeatureName = eFeature.get('name');

        if (eFeature.isTypeOf('EAttribute')) {
            this.values[eFeatureName] = this._getDefaultAttributeValue(eFeature);
        } else {
            this.values[eFeatureName] = this._getDefaultReferenceValue(eFeature);
        }
    },

    _isStructuralFeature: function(name) {
        var eClass = this.eClass;
        if (!eClass)  {
            return false;
        }

        var eFeatures = eClass.eAllStructuralFeatures();
        if (!eFeatures) {
            return false;
        }

        var eFeature = _.find(eFeatures, function(feature) {
            return feature.values ? feature.values.name === name : false;
        });

        if (eFeature) {
            if (!_.has(this.values, name)) {
                this._initFeature( eFeature );
            }
            return true;
        } else {
            return false;
        }
    },

    // EClass methods

    eAllStructuralFeatures: function() {
        if (!this.has('eSuperTypes')) {
            return [];
        }
        var superTypes = this.get('eSuperTypes');

        var eSuperFeatures = _.flatten(
            _.map(superTypes._internal, function(sup) {
                return sup.eAllStructuralFeatures();
            })
        );

        var eAllFeatures = _.union(eSuperFeatures,
            this.get('eStructuralFeatures')._internal
        );

        return eAllFeatures;
    },

    eAllSuperTypes: function() {
        var superTypes = this.get('eSuperTypes')._internal;

        var eAllSuperTypes = _.union(superTypes,
            _.flatten(_.map(superTypes, function(eSuper) {
                return eSuper.eAllSuperTypes();
            }))
        );

        return eAllSuperTypes;
    }

};

// EList
var EList = Ecore.EList = function(owner, feature) {
    this._internal = [];
    this._owner = owner;
    this._size = 0;
    this._index = {};
    this._setFeature(feature);

    return this;
};

// @private
EList.prototype = {

    _setFeature: function(feature) {
        if (feature) {
            this._feature = feature;
            this._isContainment = this._feature.get('isContainment');
        }
    },

    add: function(eObject) {
        if (this._isContainment) {
            eObject.eContainingFeature = this._feature;
            eObject.eContainer = this._owner;
        }

        this._index[this._size] = eObject;
        this._size++;
        this._internal.push(eObject);

        return this;
    },

    remove: function(eObject) {
        var values = _.values(this._index);

        return this;
    },

    size: function() {
        return this._size;
    },

    at: function(position) {
        if (this._size < position) {
            return null;
        }
        return this._internal[position];
    },

    // underscore methods.

    first: function() {
        return _.first(this._internal);
    },

    last: function() {
        return _.last(this._internal);
    },

    rest: function(index) {
        return _.rest(this._internal, index);
    },

    each: function(iterator, context) {
        return _.each(this._internal, iterator, context);
    },

    filter: function(iterator, context) {
        return _.filter(this._internal, iterator, context);
    },

    find: function(iterator, context) {
        return _.find(this._internal, iterator, context);
    },

    reject: function(iterator, context) {
        return _.reject(this._internal, iterator, context);
    },

    contains: function(object) {
        return _.contains(this._internal, object);
    },

    indexOf: function(object) {
        return _.indexOf(this._internal, object);
    }

}

function initValues(eObject) {
    var eClass = eObject.eClass;
    if (eClass) {
        var eStructuralFeatures = eClass.eAllStructuralFeatures();

        if (!eStructuralFeatures || eStructuralFeatures.length === 0) {
            return;
        }

        _.each(eStructuralFeatures, function( eFeature ) {
            var eFeatureName = eFeature.get('name');
            if (eFeatureName) {
                if (eFeature.isTypeOf('EAttribute')) {
                    if (!eObject.has(eFeatureName)) {
                        eObject.values[eFeatureName] = eObject._getDefaultAttributeValue(eFeature);
                    }
                } else {
                    var value = eObject.values[eFeatureName];
                    // reset setFeature, needed for initEcore
                    if (value instanceof EList) {
                        value._setFeature(eFeature);
                        // reset eContainer
                        if (eFeature.get('isContainment')) {
                            value.each(function(object) { object.eContainer = eObject });
                        }
                    } else if (!eObject.has(eFeatureName)) {
                        eObject.values[eFeatureName] = eObject._getDefaultReferenceValue(eFeature);
                    }
                }
            }
        });
    }
}

// EObject
//
var EObject = Ecore.EObject = function(attributes) {
    attributes || (attributes = {});

    this.eClass = attributes.eClass || null;
    this.values = {};

    initValues(this);

    return this;
};

_.extend(EObject.prototype, EObjectPrototype);

var EPackage = function(attributes) {
    attributes || (attributes = {});
    if (Ecore.EcorePackage) {
        this.eClass = Ecore.EcorePackage.EPackage;
    }

    this.values = {};

    this.values.name = attributes.name;
    this.values.nsURI = attributes.nsURI;
    this.values.nsPrefix = attributes.nsPrefix;
    this.values.eClassifiers = new EList(this);

    initValues(this);

    return this;
};

_.extend(EPackage.prototype, EObjectPrototype);

var EClass = function(attributes) {
    attributes || (attributes = {});
    if (Ecore.EcorePackage) {
        this.eClass = Ecore.EcorePackage.EClass;
    }

    this.values = {};
    this.values.name = attributes.name;
    this.values.abstract = attributes.abstract || false;
    this.values.interface = attributes.interface || false;
    this.values.eSuperTypes = new EList(this);
    this.values.eStructuralFeatures = new EList(this);

    initValues(this);

    return this;
};

_.extend(EClass.prototype, EObjectPrototype);

var EDataType = function(attributes) {
    attributes || (attributes = {});
    if (Ecore.EcorePackage) {
        this.eClass = Ecore.EcorePackage.EDataType;
    }

    this.values = {};
    this.values.name = attributes.name;

    initValues(this);

    return this;
};

_.extend(EDataType.prototype, EObjectPrototype);

var EReference = function(attributes) {
    attributes || (attributes = {});
    if (Ecore.EcorePackage) {
        this.eClass = Ecore.EcorePackage.EReference;
    }

    this.values = {
        name: attributes.name,
        lowerBound: attributes.lowerBound || 0,
        upperBound: attributes.upperBound || 1,
        isContainment: attributes.isContainment || false,
        eType: attributes.eType || null,
        eOpposite: attributes.eOpposite || null
    };

    initValues(this);

    return this;
};

_.extend(EReference.prototype, EObjectPrototype);

var EAttribute = function(attributes) {
    attributes || (attributes = {});
    if (Ecore.EcorePackage) {
        this.eClass = Ecore.EcorePackage.EAttribute;
    }

    this.values = {
        name: attributes.name,
        lowerBound: attributes.lowerBound || 0,
        upperBound: attributes.upperBound || 1,
        eType: attributes.eType || null
    };

    initValues(this);

     return this;
};

_.extend(EAttribute.prototype, EObjectPrototype);

var EFactory = function(attributes) {
    attributes || (attributes = {});
    if (Ecore.EcorePackage) {
        this.eClass = Ecore.EcorePackage.EFactory;
    }

    this.values = {
        ePackage: attributes.ePackage
    };

    initValues(this);

    return this;
};

_.extend(EFactory.prototype, EObjectPrototype);

function initEcore(ecorePackage) {

    // EClass
    var eClass = ecorePackage.EClass = new EClass({
        name: 'EClass'
    });
    eClass.eClass = eClass;

    // DataTypes
    var eString = new EDataType({name: 'EString'});
    ecorePackage.EString = eString;
    var eInteger = new EDataType({name: 'EInteger'});
    ecorePackage.EInteger = eInteger;
    var eBoolean = new EDataType({name: 'EBoolean'});
    ecorePackage.EBoolean = eBoolean;

    // EModelElement
    var eModelElement = ecorePackage.EModelElement = new EClass({
        name: 'EModelElement',
        abstract: true
    });
    eModelElement.eClass = eClass;

    // ENamedElement
    var eNamedElement = ecorePackage.ENamedElement = new EClass({
        name: 'ENamedElement',
        abstract: true
    });
    eNamedElement.eClass = eClass;

    eNamedElement.get('eSuperTypes').add(eModelElement);

    // EAttribute
    var eAttribute = ecorePackage.EAttribute = new EClass({
        name: 'EAttribute'
    });
    eAttribute.eClass = eClass;

    // EAttribute.iD
    var eAttribute_iD = new EAttribute({
        name: 'iD',
        eType: eBoolean
    });
    eAttribute_iD.eClass = eAttribute;
    ecorePackage.EAttribute_iD = eAttribute_iD;

    eAttribute.get('eStructuralFeatures').add(eAttribute_iD);

    // EReference
    var eReference = ecorePackage.EReference = new EClass({
        name: 'EReference'
    });
    eReference.eClass = eClass;

    // EReference.isContainment
    var eReference_isContainment = new EAttribute({
        name: 'isContainment',
        eType: eBoolean
    });
    eReference_isContainment.eClass = eAttribute;
    ecorePackage.EReference_isContainment = eReference_isContainment;

    // EReference.container
    var eReference_container = new EAttribute({
        name: 'container',
        eType: eBoolean
    });
    eReference_container.eClass = eAttribute;
    ecorePackage.EReference_container = eReference_container;

    // EReference.resolveProxies
    var eReference_resolveProxies = new EAttribute({
        name: 'resolveProxies',
        eType: eBoolean
    });
    eReference_resolveProxies.eClass = eAttribute;
    ecorePackage.EReference_resolveProxies = eReference_resolveProxies;

    eReference.get('eStructuralFeatures').add(eReference_isContainment);
    eReference.get('eStructuralFeatures').add(eReference_container);
    eReference.get('eStructuralFeatures').add(eReference_resolveProxies);

    // EPackage
    var ePackage = ecorePackage.EPackage = new EClass({
        name: 'EPackage'
    });
    ePackage.eClass = eClass;
    ePackage.get('eSuperTypes').add(eNamedElement);

    // EPackage.nsURI
    var ePackage_nsURI = new EAttribute({
        name: 'nsURI',
        eType: eString
    });
    ePackage_nsURI.eClass = eAttribute;
    ecorePackage.EPackage_nsURI = ePackage_nsURI;

    // EPackage.nsPrefix
    var ePackage_nsPrefix = new EAttribute({
        name: 'nsPrefix',
        eType: eString
    });
    ePackage_nsPrefix.eClass = eAttribute;
    ecorePackage.EPackage_nsPrefix = ePackage_nsPrefix;

    ePackage.get('eStructuralFeatures').add(ePackage_nsURI);
    ePackage.get('eStructuralFeatures').add(ePackage_nsPrefix);

    // ENamedElement.name
    var eNamedElement_name = new EAttribute({
        name: 'name',
        eType: eString
    });
    eNamedElement_name.eClass = eAttribute;
    ecorePackage.ENamedElement_name = eNamedElement_name;

    eNamedElement.get('eStructuralFeatures').add(eNamedElement_name);

    // EClass.abstract
    var eClass_abstract = new EAttribute({
        name: 'abstract',
        lowerBound: 0,
        upperBound: 1,
        eType: eBoolean
    });
    eClass_abstract.eClass = eAttribute;
    ecorePackage.EClass_abstract = eClass_abstract;

    // EClass.interface
    var eClass_interface = new EAttribute({
        name: 'interface',
        eType: eBoolean
    });
    eClass_interface.eClass = eAttribute;
    ecorePackage.EClass_interface = eClass_interface;

    // EClass.eStructuralFeatures
    var eClass_eStructuralFeatures = new EReference({
        name: 'eStructuralFeatures',
        lowerBound: 0,
        upperBound: -1,
        isContainment: true
    });
    eClass_eStructuralFeatures.eClass = eReference;

    // EClass.eSuperTypes
    var eClass_eSuperTypes = new EReference({
        name: 'eSuperTypes',
        lowerBound: 0,
        upperBound: -1,
        isContainment: false
    });
    eClass_eSuperTypes.eClass = eReference;
    eClass.get('eSuperTypes')._setFeature( eClass_eSuperTypes );

    eClass.get('eStructuralFeatures').add(eClass_abstract);
    eClass.get('eStructuralFeatures').add(eClass_interface);
    eClass.get('eStructuralFeatures').add(eClass_eStructuralFeatures);
    eClass.get('eStructuralFeatures').add(eClass_eSuperTypes);

    // ETypedElement
    var eTypedElement = ecorePackage.ETypedElement = new EClass({
        name: 'ETypedElement',
        abstract: true
    });
    eTypedElement.eClass = eClass;
    eTypedElement.get('eSuperTypes').add(eNamedElement);

    // ETypedElement.ordered
    var eTypedElement_ordered = new EAttribute({
        name: 'ordered',
        eType: eBoolean
    });
    eTypedElement_ordered.eClass = eAttribute;
    ecorePackage.ETypedElement_ordered = eTypedElement_ordered;

    // ETypedElement.unique
    var eTypedElement_unique = new EAttribute({
        name: 'unique',
        eType: eBoolean
    });
    eTypedElement_unique.eClass = eAttribute;
    ecorePackage.ETypedElement_unique = eTypedElement_unique;

    // ETypedElement.lowerBound
    var eTypedElement_lowerBound = new EAttribute({
        name: 'lowerBound',
        eType: eInteger
    });
    eTypedElement_lowerBound.eClass = eAttribute;
    ecorePackage.ETypedElement_lowerBound = eTypedElement_lowerBound;

    // ETypedElement.upperBound
    var eTypedElement_upperBound = new EAttribute({
        name: 'upperBound',
        eType: eInteger
    });
    eTypedElement_upperBound.eClass = eAttribute;
    ecorePackage.ETypedElement_upperBound = eTypedElement_upperBound;

    // ETypedElement.many
    var eTypedElement_many = new EAttribute({
        name: 'many',
        eType: eBoolean
    });
    eTypedElement_many.eClass = eAttribute;
    ecorePackage.ETypedElement_many = eTypedElement_many;

    // ETypedElement.required
    var eTypedElement_required = new EAttribute({
        name: 'required',
        eType: eBoolean
    });
    eTypedElement_required.eClass = eAttribute;
    ecorePackage.ETypedElement_required = eTypedElement_required;

    // ETypedElement.eType
    var eTypedElement_eType = new EReference({
        name: 'eType',
        eType: eClassifier
    });
    eTypedElement_eType.eClass = eReference;
    ecorePackage.ETypedElement_eType = eTypedElement_eType;

    eTypedElement.get('eStructuralFeatures').add(eTypedElement_ordered);
    eTypedElement.get('eStructuralFeatures').add(eTypedElement_unique);
    eTypedElement.get('eStructuralFeatures').add(eTypedElement_lowerBound);
    eTypedElement.get('eStructuralFeatures').add(eTypedElement_upperBound);
    eTypedElement.get('eStructuralFeatures').add(eTypedElement_many);
    eTypedElement.get('eStructuralFeatures').add(eTypedElement_required);

    // EStructuralFeature
    var eStructuralFeature = ecorePackage.EStructuralFeature = new EClass({
        name: 'EStructuralFeature'
    });
    eStructuralFeature.eClass = eClass;
    eStructuralFeature.set('abstract', true);
    eStructuralFeature.set('interface', false);
    eStructuralFeature.get('eSuperTypes').add(eTypedElement);

    eAttribute.get('eSuperTypes').add(eStructuralFeature);
    eReference.get('eSuperTypes').add(eStructuralFeature);

    // EStructuralFeature.changeable
    var eStructuralFeature_changeable = new EAttribute({
        name: 'changeable',
        eType: eBoolean
    });
    eStructuralFeature_changeable.eClass = eAttribute;
    ecorePackage.EStructuralFeature_changeable = eStructuralFeature_changeable;

    // EStructuralFeature.volatile
    var eStructuralFeature_volatile = new EAttribute({
        name: 'volatile',
        eType: eBoolean
    });
    eStructuralFeature_volatile.eClass = eAttribute;
    ecorePackage.EStructuralFeature_volatile = eStructuralFeature_volatile;

    // EStructuralFeature.transient
    var eStructuralFeature_transient = new EAttribute({
        name: 'transient',
        eType: eBoolean
    });
    eStructuralFeature_transient.eClass = eAttribute;
    ecorePackage.EStructuralFeature_transient = eStructuralFeature_transient;

    // EStructuralFeature.defaultValueLiteral
    var eStructuralFeature_defaultValueLiteral = new EAttribute({
        name: 'defaultValueLiteral',
        eType: eString
    });
    eStructuralFeature_defaultValueLiteral.eClass = eAttribute;
    ecorePackage.EStructuralFeature_defaultValueLiteral = eStructuralFeature_defaultValueLiteral;

    // EStructuralFeature.defaultValue
    var eStructuralFeature_defaultValue = new EAttribute({
        name: 'defaultValue',
        eType: eString
    });
    eStructuralFeature_defaultValue.eClass = eAttribute;
    ecorePackage.EStructuralFeature_defaultValue = eStructuralFeature_defaultValue;

    // EStructuralFeature.unsettable
    var eStructuralFeature_unsettable = new EAttribute({
        name: 'unsettable',
        eType: eBoolean
    });
    eStructuralFeature_unsettable.eClass = eAttribute;
    ecorePackage.EStructuralFeature_unsettable = eStructuralFeature_unsettable;

    // EStructuralFeature.derived
    var eStructuralFeature_derived = new EAttribute({
        name: 'derived',
        eType: eBoolean
    });
    eStructuralFeature_derived.eClass = eAttribute;
    ecorePackage.EStructuralFeature_derived = eStructuralFeature_derived;

    eStructuralFeature.get('eStructuralFeatures').add(eStructuralFeature_changeable);
    eStructuralFeature.get('eStructuralFeatures').add(eStructuralFeature_volatile);
    eStructuralFeature.get('eStructuralFeatures').add(eStructuralFeature_transient);
    eStructuralFeature.get('eStructuralFeatures').add(eStructuralFeature_defaultValue);
    eStructuralFeature.get('eStructuralFeatures').add(eStructuralFeature_defaultValueLiteral);
    eStructuralFeature.get('eStructuralFeatures').add(eStructuralFeature_unsettable);
    eStructuralFeature.get('eStructuralFeatures').add(eStructuralFeature_derived);

    // EOperation
    var eOperation = ecorePackage.EOperation = new EClass({
        name: 'EOperation'
    });
    eOperation.eClass = eClass;
    eOperation.get('eSuperTypes').add(eTypedElement);

    // EParameter
    var eParameter = ecorePackage.EParameter = new EClass({
        name: 'EParameter'
    });
    eParameter.eClass = eClass;
    eParameter.get('eSuperTypes').add(eTypedElement);

    // EClassifier
    var eClassifier = ecorePackage.EClassifier = new EClass({
        name: 'EClassifier',
        abstract: true
    });
    eClassifier.eClass = eClass;

    // EDataType
    var eDataType = ecorePackage.EDataType = new EClass({
        name: 'EDataType'
    });
    eDataType.eClass = eClass;

    // Setting DataTypes eClass
    eString.eClass = eDataType;
    eInteger.eClass = eDataType;
    eBoolean.eClass = eDataType;

    eClassifier.get('eSuperTypes').add(eNamedElement);
    eClass.get('eSuperTypes').add(eClassifier);
    eDataType.get('eSuperTypes').add(eClassifier);

    // EPackage.eClassifiers
    var ePackage_eClassifiers = new EReference({
        name: 'eClassifiers',
        lowerBound: 0,
        upperBound: -1,
        isContainment: true,
        eType: eClassifier
    });
    ePackage_eClassifiers.eClass = eReference;
    ecorePackage.EPackage_eClassifiers = ePackage_eClassifiers;

    ePackage.get('eStructuralFeatures').add(ePackage_eClassifiers);

    // EFactory
    var eFactory = ecorePackage.EFactory = new EClass({
        name: 'EFactory'
    });
    eFactory.eClass = eClass;
    eFactory.get('eSuperTypes').add(eModelElement);
    ecorePackage.EFactory = eFactory;

    // EPackage_eFactoryInstance
    var ePackage_eFactoryInstance = new EReference({
        name: 'eFactoryInstance',
        lowerBound: 0,
        upperBound: 1,
        eType: eFactory
    });
    ePackage_eFactoryInstance.eClass = eReference;
    ePackage.get('eStructuralFeatures').add(ePackage_eFactoryInstance);
    ecorePackage.EPackage_eFactoryInstance = ePackage_eFactoryInstance;

    // EFactory.ePackage
    var eFactory_ePackage = new EReference({
        name: 'ePackage',
        lowerBound: 1,
        upperBound: 1,
        eType: ePackage,
        'eOpposite': ePackage_eFactoryInstance
    });
    eFactory_ePackage.eClass = eReference;
    ecorePackage.EFactory_ePackage = eFactory_ePackage;

    ePackage_eFactoryInstance.set('eOpposite', eFactory_ePackage);

    eFactory.get('eStructuralFeatures').add(eFactory_ePackage);

    // setting internal features for EList.
    initValues(eClass);

    initValues(eModelElement);
    initValues(eNamedElement);
    initValues(eClassifier);

    initValues(eDataType);
    initValues(eTypedElement);
    initValues(eStructuralFeature);
    initValues(eAttribute);
    initValues(eReference);
    initValues(eOperation);
    initValues(eParameter);
    initValues(ePackage);
    initValues(eFactory);
};

// Initialize the EcorePackage.
Ecore.EcorePackage = new EPackage({name: 'ecore'});
initEcore(Ecore.EcorePackage);
Ecore.EcorePackage.get('eClassifiers')._setFeature(Ecore.EcorePackage.EPackage_eClassifiers);
Ecore.EcorePackage.eClass = Ecore.EcorePackage.EPackage;

Ecore.EcorePackage.set('nsURI', 'http://www.eclipse.org/emf/2002/Ecore');
Ecore.EcorePackage.set('nsPrefix', 'ecore');

Ecore.EcorePackage.get('eClassifiers').add(Ecore.EcorePackage.EModelElement);
Ecore.EcorePackage.get('eClassifiers').add(Ecore.EcorePackage.ENamedElement);
Ecore.EcorePackage.get('eClassifiers').add(Ecore.EcorePackage.EPackage);
Ecore.EcorePackage.get('eClassifiers').add(Ecore.EcorePackage.EClassifier);
Ecore.EcorePackage.get('eClassifiers').add(Ecore.EcorePackage.EClass);
Ecore.EcorePackage.get('eClassifiers').add(Ecore.EcorePackage.EDataType);
Ecore.EcorePackage.get('eClassifiers').add(Ecore.EcorePackage.ETypedElement);
Ecore.EcorePackage.get('eClassifiers').add(Ecore.EcorePackage.EStructuralFeature);
Ecore.EcorePackage.get('eClassifiers').add(Ecore.EcorePackage.EAttribute);
Ecore.EcorePackage.get('eClassifiers').add(Ecore.EcorePackage.EReference);
Ecore.EcorePackage.get('eClassifiers').add(Ecore.EcorePackage.EOperation);
Ecore.EcorePackage.get('eClassifiers').add(Ecore.EcorePackage.EParameter);
Ecore.EcorePackage.get('eClassifiers').add(Ecore.EcorePackage.EFactory);

// Initialize EcoreFactory.
Ecore.EcoreFactory = new EFactory();
Ecore.EcoreFactory.eClass = Ecore.EcorePackage.EFactory;

Ecore.EcorePackage.set('eFactoryInstance', Ecore.EcoreFactory);

Ecore.EcoreFactory.createEPackage = function(attributes) {
    return new EPackage(attributes);
};

Ecore.EcoreFactory.createEClass = function(attributes) {
    return new EClass(attributes);
};

Ecore.EcoreFactory.createEAttribute = function(attributes) {
    return new EAttribute(attributes);
};

Ecore.EcoreFactory.createEReference = function(attributes) {
    return new EReference(attributes);
};

Ecore.EcoreFactory.create = function(eClass, attributes) {
    switch (eClass) {
        case 'EPackage':
            return this.createEPackage(attributes);
            break;
        case 'EClass':
            return this.createEClass(attributes);
            break;
        case 'EAttribute':
            return this.createEAttribute(attributes);
            break;
        case 'EReference':
            return this.createEReference(attributes);
            break;
        default:
            return null;
    }
};


EcoreFactory = Ecore.EcoreFactory;

Ecore.$ = root.jQuery || root.Zepto || root.ender || null;

var Ajax = {

    get: function(url, success, error) {
        if (Ecore.$) {
            return Ecore.$.ajax({
                url: url,
                dataType: 'json',
                success: success,
                error: error
            });
        } else {
            return null;
        }
    },

    post: function(url, success, error) {
            // TODO
    }

};

Ecore.JSON = {

    parse: function(data) {
        var contents = [];

        function processFeature(object, eObject) {
            if (!object || !eObject)
                return function( feature ) {};

            return function( feature ) {
                var featureName = feature.get('name'),
                    value = object[featureName];

                if ( feature.isTypeOf('EAttribute') ) {
                    eObject.set( featureName, value );
                } else {
                    if (feature.get('upperBound') === 1) {
                        eObject.set( featureName, parseObject(value) );
                    } else {
                        _.each(value, function(val) {
                            eObject.get( featureName ).add( parseObject(val) );
                        });
                    }
                }
            };
        }

        function parseObject(object) {
            if (object && object.eClass) {
                var eClass = Ecore.Registry.getEObject(object.eClass),
                    features = eClass.eAllStructuralFeatures(),
                    eObject = Ecore.create(eClass);

                _.each( features, processFeature(object, eObject) );

                return eObject;
            }

            return null;
        }

        contents.push( parseObject(data) );

        return contents;
    },

    toJSON: function(model) {
        var contents = model.contents;

        function processFeature( object, data ) {
            if (!object || !data) {
                return function(feature) {};
            }

            return function( feature ) {
                var featureName = feature.get('name');
                var value = object.get(featureName);

                if (feature.isTypeOf('EAttribute')) {
                    data[featureName] = value;
                } else {
                    if (feature.get('isContainment')) {
                        if (feature.get('upperBound') === 1) {
                            data[featureName] = jsonObject(value);
                        } else {
                            data[featureName] = [];
                            _.each(value, function(val) {
                                data[featureName].push( jsonObject(val) );
                            });
                        }
                    }
                }
            };
        }

        function jsonObject(object) {
            var eClass = object.eClass,
                features = eClass.get('eStructuralFeatures'),
                data = {};

            _.each( features, processFeature(object, data) );

            return data;
        }

        var data;
        if (contents.length === 1) {
            var eObject = contents[0];
            data = jsonObject(eObject);
        }
        return data;
    }

};

// Model or Resource ?
var Model = Ecore.Model = function(uri) {
    this.uri = uri;
    this.contents = [];

    return this;
};

Model.prototype = {

    clear: function() {
        this.contents.length = 0;
        return this;
    },

    add: function(eObject) {
        if (eObject) {
            eObject.eModel = this;
            eObject.eContainer = this;
            this.contents.push(eObject);
        }

        return this;
    },

    addAll: function(content) {
        if (_.isArray(content)) {
            _.each(content, function(eObject) {
                this.add(eObject);
            }, this);
        }

        return this;
    },

    getEObject: function(fragment) {
        if (fragment) {
            return buildIndex(this)[fragment];
        }
        return null;
    },

    each: function(iterator, context) {
        return _.each(this.contents, iterator, context);
    },

    save: function(success, error) {
        var data = Ecore.JSON.toJSON(this);
    },

    load: function(success, error, data) {
        var model = this;
        var loadSuccess = function(data) {
            var content = Ecore.JSON.parse(data);
            model.addAll(content);
            return success(model);
        };

        if (data) {
            return loadSuccess(data);
        } else {
            return Ajax.get(this.uri, loadSuccess, error);
        }
    }
};

function initEcoreModel() {
    var model = new Model('http://www.eclipse.org/emf/2002/Ecore');
    model.add(Ecore.EcorePackage);

    Ecore.Registry.register(model);

    return model;
}

var ModelRegistry = Ecore.ModelRegistry = function() {
    var instance;

    ModelRegistry = function ModelRegistry() {
        return instance;
    };

    ModelRegistry.prototype = this;

    instance = new ModelRegistry();

    instance.constructor = ModelRegistry;
    instance.models = {};

    return instance;
};

ModelRegistry.prototype = {

    register: function(model) {
        this.models[model.uri] = model;

        return this;
    },

    getEObject: function(uri) {
        var split = uri.split('#');
        var base = split[0];
        var fragment;
        if (split.length === 2) {
            fragment = split[1];
        }

        var model = this.models[base];
        if (model && fragment) {
            var index = buildIndex(model);
            var found = index[fragment];
            return found;
        }

        return null;
    }

};

Ecore.Registry = new Ecore.ModelRegistry();
initEcoreModel();

function buildIndex(model) {
    var base = model.uri,
        index = {},
        contents = model.contents;

    if (contents.length === 1) {
        var root = contents[0];

        function _buildIndex(object, idx) {
            var eClass = object.eClass,
                eFeatures = eClass.eAllStructuralFeatures();
            index[idx] = object;

            _.each(eFeatures, function(feature) {
                var value = object.get(feature.get('name'));

                if (value && feature.isTypeOf('EReference') && feature.get('isContainment')) {

                    if (feature.get('upperBound') === 1) {

                        var _idx = value.eURIFragmentSegment(feature, idx, -1);
                        _buildIndex(value, _idx);

                    } else {

                        value.each(function(val) {
                            var position = value.indexOf( val );
                            var _idx = val.eURIFragmentSegment(feature, idx, position);
                            _buildIndex(val, _idx);
                        });

                    }

                }
            });
        }

        var iD = root.eClass.get('eIDAttribute') || null;
        if (iD) {
            _buildIndex(root, '//' + root.get(iD.name));
        } else {
            _buildIndex(root, '/');
        }
    }

    return index;
}

})();