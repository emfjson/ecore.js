 // Ecore.js.
 // Ecore (EMOF) Implementation in JavaScript.
 //
 // Copyright (C) 2012 Guillaume Hillairet.
 // EPL License.
 //
(function() {

// The root object, `window` in the browser, or `global` on the server.
var root = this;

var _ = root._ || require('underscore');

/**
 * Ecore
 *
 * @namespace Ecore
 */
var Ecore = {

   /**
    * Creates an instance of the given EClass.
    *
    * The resulting object is an EObject having it's properties
    * initialized from the structural features of the EClass.
    *
    * Example:
    *   var User = Ecore.EcoreFactory.createEClass({name: 'User'});
    *   var u1 = Ecore.create(User);
    *
    * @param {EClass}
    * @return {EObject}
    */
    create: function(eClass) {
        if (!eClass.eClass) {
            throw new Error('Cannot create EObject from undefined EClass');
        }

        return new Ecore.EObject({ eClass: eClass });
    },

    createEPackage: function(attributes) {
        return new EPackage(attributes);
    },

    createEClass: function(attributes) {
        return new EClass(attributes);
    },

    createEDataType: function(attributes) {
        return new EDataType(attributes);
    },

    createEAttribute: function(attributes) {
        return new EAttribute(attributes);
    },

    createEReference: function(attributes) {
        return new EReference(attributes);
    }

};

Ecore.version = '0.1.1';

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Ecore;
    }
    exports.Ecore = Ecore;
} else {
    root.Ecore = Ecore;
}

/**
 * EObject
 *
 * @constructor
 */
var EObject = Ecore.EObject = function(attributes) {
    attributes || (attributes = {});

    this.eClass = attributes.eClass || null;
    this.values = {};

    initValues(this);

    return this;
};

function getFragment(eModelElement) {
    var eContainer = eModelElement.eContainer;

    if (!eContainer || eContainer instanceof Ecore.Resource) {
        return '/';
    } else {
        return getFragment(eContainer) + '/' + eModelElement.get('name');
    }
}

var EObjectPrototype = {

    /**
     * @method has
     * @param {String}
     * @member EObject
     * @return {Boolean} Returns true if has property
     */
    has: function(name) {
        return this.values.hasOwnProperty(name) || this._isStructuralFeature(name);
    },

    isSet: function(name) {
        if (!this.has(name)) return false;

        var eClass = this.eClass;
        if (!eClass) return false;

        var value = this.get(name);
        if (value instanceof EList) {
            return value.size() > 0;
        } else {
            return value !== null;
        }
    },

    /**
     * @method set
     * @member EObject
     * @param {String} name
     * @param {Object} value
     * @return {EObject} this
     */
    set: function(name, value) {
        if (this.has(name)) {
            this.values[name] = value;
        }

        return this;
    },

    /**
     * @method get
     * @member EObject
     * @param {String} name
     * @return {Object} Returns property value
     */
    get: function(name) {
        var value = null;
        if (this.has(name)) {
            value = this.values[name];
        }

        if (typeof value === 'function') {
            return value();
        } else {
            return value;
        }
    },

    /**
     * @method isTypeOf
     * @member EObject
     * @param {String} type
     * @return {Boolean} Returns true if EObject is a instance of type.
     */
    isTypeOf: function(type) {
        if (!this.eClass) return false;

        return this.eClass.get('name') === type;
    },

    /**
     * @method isTypeOf
     * @member EObject
     * @param {String}
     * @return {Boolean} Returns true if EObject is a kind of type.
     */
    isKindOf: function(type) {
        if(!this.eClass) return false;

        return _.any(this.eClass.eAllSuperTypes(), function(eSuper) {
            return eSuper.get('name') === type;
        });
    },

    eResource: function() {
        if (!this.eContainer) return null;
        if (this.eContainer instanceof Ecore.Resource) return this.eContainer;

        return this.eContainer.eResource();
    },

    /**
     * @method uri
     * @member EObject
     * @return {String} Returns EObject URI
     */
    eURI: function() {
        var eModel = this.eResource(),
            index = buildIndex(eModel),
            current = this;

        var fragment = (function() {
            for (var key in index) {
                if (index[key] === current)
                    return key;
            }
            return null;
        })();

        return eModel.uri + '#' + fragment;
    },

    /**
     * @method eURIFragmentSegment
     * @private
     */
    eURIFragmentSegment: function(feature, parentIndex, position) {
        if (this.isKindOf('EModelElement')) {
            return getFragment(this);
        } else {
            var eClass = this.eClass,
                iD = eClass.get('eIDAttribute'),
                _idx;

            if (iD) {
                _idx = val.get(iD.get('name'));
            } else {
                _idx = parentIndex + '/@' + feature.get('name');
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

        if (!eFeatureUpperBound) return null;

        if (eFeatureUpperBound === 1) {
            if (eType) {
                switch(eType.get('name')) {
                    case 'EBoolean':
                        return false;
                    case 'EInteger':
                        return 0;
                    default:
                        return null;
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
        if (!eFeatureUpperBound) return null;

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

    /**
     * @method eAllStructuralFeatures
     * @return {Array} Returns Array of EStructuralFeature
     */
    eAllStructuralFeatures: function() {
        if (!this.has('eSuperTypes')) return [];

        var superTypes = this.eAllSuperTypes();

        var eSuperFeatures = _.flatten(
            _.map(superTypes, function(sup) {
                return sup.eAllStructuralFeatures();
            })
        );

        var eAllFeatures = _.union(eSuperFeatures,
            this.get('eStructuralFeatures')._internal
        );

        return _.isArray(eAllFeatures) ? eAllFeatures : [];
    },

    /**
     * @method eAllSuperTypes
     * @return {Array} Returns Array of EClass
     */
    eAllSuperTypes: function() {
        if (!this.has('eSuperTypes')) return [];

        var superTypes = this.get('eSuperTypes')._internal;

        if (!superTypes) return [];

        var eAllSuperTypes = _.union(superTypes,
            _.flatten(_.map(superTypes, function(eSuper) {
                return eSuper.eAllSuperTypes();
            }))
        );

        return _.isArray(eAllSuperTypes) ? eAllSuperTypes : [];
    },

    getEStructuralFeature: function(name) {
        if (!this.has('eStructuralFeatures')) return null;

        return this.get('eStructuralFeatures').find(function(feature) {
            return feature.get('name') === name;
        });
    }

};

_.extend(EObject.prototype, EObjectPrototype);

// EList

/**
 * EList is a List implementation.
 *
 * @class EList
 * @constructor
 * @param {EObject} owner - the owner of the feature.
 * @param {EStructuralFeature} feature - the feature associated.
 */
var EList = Ecore.EList = function(owner, feature) {
    this._internal = [];
    this._owner = owner;
    this._size = 0;
    this._setFeature(feature);

    return this;
};

EList.prototype = {

    /**
     * @method _setFeature
     * @private
     */
    _setFeature: function(feature) {
        if (feature) {
            this._feature = feature;
            this._isContainment = this._feature.get('isContainment');
        }
    },

    /*
     * Adds an EObject.
     *
     * @method add
     * @public
     * @member EList
     * @param {EObject} eObject
     *
     */
    add: function(eObject) {
        if (!eObject) return this;

        if (this._isContainment) {
            eObject.eContainingFeature = this._feature;
            eObject.eContainer = this._owner;
        }

        this._size++;
        this._internal.push(eObject);

        return this;
    },

    addAll: function(values) {
        if (!_.isArray(values)) return this.add(values);
        _.each(values, function(value) {
            this.add(value);
        }, this);

        return this;
    },

    /*
     * @method remove
     * @public
     * @member EList
     * @param {EObject}
     */
    remove: function(eObject) {
        var values = _.values(this._index);

        return this;
    },

    /*
     * @method size
     * @public
     * @member EList
     */
    size: function() {
        return this._size;
    },

    /*
     * @method at
     * @public
     * @member EList
     * @param {integer}
     */
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

    map: function(iterator, context) {
        return _.map(this._internal, iterator, context);
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

};

function initValues(eObject) {
    var eClass = eObject.eClass;
    if (eClass) {
        var eStructuralFeatures = eClass.eAllStructuralFeatures();

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
                            value.each(function(object) { object.eContainer = eObject; });
                        }
                    } else if (!eObject.has(eFeatureName)) {
                        eObject.values[eFeatureName] = eObject._getDefaultReferenceValue(eFeature);
                    }
                }
            }
        });
    }
}

function setValues(eObject, attributes) {
    if (!eObject.eClass) return;

    _.each(attributes, function(value, key) {
        var eFeature = this.eClass.getEStructuralFeature(key);
        if (eFeature) {
            if (eFeature.get('upperBound') === 1) {
                this.set(key, value);
            } else {
                this.get(key).addAll(value);
            }
        }
    }, eObject);
}

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
    setValues(this, attributes);

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
    setValues(this, attributes);

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
    setValues(this, attributes);

    return this;
};

_.extend(EDataType.prototype, EObjectPrototype);

var EReference = function(attributes) {
    attributes || (attributes = {});
    if (Ecore.EcorePackage) {
        this.eClass = Ecore.EcorePackage.EReference;
    }

    this.values = {};
    this.values.name = attributes.name;
    this.values.lowerBound = attributes.lowerBound || 0;
    this.values.upperBound = attributes.upperBound || 1;
    this.values.isContainment = attributes.isContainment || false;
    this.values.eType = attributes.eType || null;
    this.values.eOpposite = attributes.eOpposite || null;

    initValues(this);
    setValues(this, attributes);

    return this;
};

_.extend(EReference.prototype, EObjectPrototype);

var EAttribute = function(attributes) {
    attributes || (attributes = {});
    if (Ecore.EcorePackage) {
        this.eClass = Ecore.EcorePackage.EAttribute;
    }

    this.values = {};
    this.values.name = attributes.name;
    this.values.lowerBound = attributes.lowerBound || 0;
    this.values.upperBound = attributes.upperBound || 1;
    this.values.eType = attributes.eType || null;

    initValues(this);
    setValues(this, attributes);

     return this;
};

_.extend(EAttribute.prototype, EObjectPrototype);

var EFactory = function(attributes) {
    attributes || (attributes = {});
    if (Ecore.EcorePackage) {
        this.eClass = Ecore.EcorePackage.EFactory;
    }

    this.values = {};
    this.values.ePackage = attributes.ePackage;

    initValues(this);
    setValues(this, attributes);

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
    eTypedElement.get('eStructuralFeatures').add(eTypedElement_eType);

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
}

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

Ecore.EcoreFactory.create = function(eClass, attributes) {
    switch (eClass) {
        case 'EPackage':
            return Ecore.createEPackage(attributes);
        case 'EClass':
            return Ecore.createEClass(attributes);
        case 'EDataType':
            return Ecore.createEDataType(attributes);
        case 'EAttribute':
            return Ecore.createEAttribute(attributes);
        case 'EReference':
            return Ecore.createEReference(attributes);
        default:
            return null;
    }
};
