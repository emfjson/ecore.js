//     Ecore.js
//     Ecore Implementation in JavaScript.
//
//     ©2014 Guillaume Hillairet.
//     EPL License (http://www.eclipse.org/legal/epl-v10.html)

(function() {

// The root object, `window` in the browser, or `global` on the server.
var root = this;

// Load underscore from the `window` object in the browser or via the require function
// on the server.
var _ = root._;
if (!_ && (typeof require !== 'undefined')) _ = require('underscore');


// Ecore

// Base object providing common methods for the creation of model elements such as
// `EPackage`, `EClass`, `EDataType`, `EAttribute` and `EReference`. As well as the
// method `create` for the creation of domain objects, `EObject`, from a predefined
// `EClass`.

var Ecore = {

    // Returns an instance of the given EClass.
    //
    // The resulting object is an EObject having it's properties
    // initialized from the structural features of the EClass.
    //
    // Example:
    //
    //      var User = Ecore.EClass.create({
    //          name: 'User',
    //          eStructuralFeatures: [
    //              {
    //                  eClass: Ecore.EAttribute,
    //                  name: 'userName',
    //                  eType: Ecore.EString
    //              }
    //          ]
    //      });
    //
    //      var u1 = Ecore.create(User);
    //      u1.set('userName', 'Randy');
    //
    //      alternatively
    //
    //      var u1 = User.create({ userName: 'Randy' });
    //
    //      u1.get('userName'); -> Randy

    create: function(eClass, attributes) {
        var attrs,
            eObject;

        if (!attributes) {
            if (eClass instanceof EObject) {
                attrs = {};
                attrs.eClass = eClass;
            } else {
                attrs = eClass;
            }
        } else {
            attrs = attributes;
            attrs.eClass = attributes.eClass || eClass;
        }

        if (!attrs.eClass || attrs.eClass.get('abstract')) {
            throw new Error('Cannot create EObject from undefined or abstract EClass');
        }

        eObject = new EObject( attrs );

        return eObject;
    }

};

// Export Ecore
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Ecore;
    }
    exports.Ecore = Ecore;
} else {
    root.Ecore = Ecore;
}

var Events = {

    on: function(events, callback, context) {
        var calls, event, list;
        if (!callback) return this;

        events = events.split(/\s+/);
        calls = this._callbacks || (this._callbacks = {});

        while(event = events.shift()) {
            list = calls[event] || (calls[event] = []);
            list.push(callback, context);
        }

        return this;
    },

    off: function(events, callback, context) {
        var event, calls, list, i;

        if (!(calls = this._callbacks)) return this;
        if (!(events || callback || context)) {
            delete this._callbacks;
            return this;
        }

        events = events ? events.split(/\s+/) : _.keys(calls);
        while (event = events.shift()) {
            if (!(list = calls[event]) || !(callback || context)) {
                delete calls[event];
                continue;
            }

            for (i = list.length - 2; i >= 0; i -= 2) {
                if (!(callback && list[i] !== callback || context && list[i + 1] !== context)) {
                    list.splice(i, 2);
                }
            }
        }

        return this;
    },

    trigger: function(events) {
        var event, calls, list, i, length, args, all, rest;
        if (!(calls = this._callbacks)) return this;

        rest = [];
        events = events.split(/\s+/);
        for (i = 1, length = arguments.length; i < length; i++) {
            rest[i - 1] = arguments[i];
        }
        // For each event, walk through the list of callbacks twice, first to
        // trigger the event, then to trigger any `"all"` callbacks.
        while (event = events.shift()) {
            if (all = calls.all) all = all.slice();
            if (list = calls[event]) list = list.slice();

            if (list) {
                for (i = 0, length = list.length; i < length; i += 2) {
                    list[i].apply(list[i + 1] || this, rest);
                }
            }
            // Execute "all" callbacks.
            if (all) {
                args = [event].concat(rest);
                for (i = 0, length = all.length; i < length; i += 2) {
                    all[i].apply(all[i + 1] || this, args);
                }
            }
        }

        return this;
    }
};

// EObject
//
// Implementation of EObject. The constructor takes as parameter a hash
// containing values to be set. Values must be defined accordingly to the
// eClass features.
//

var EObject = function(attributes) {
    if (!attributes) attributes = {};

    this.eClass = attributes.eClass;
    this.values = {};

    // stores function for eOperations.
    attributes._ && (this._ = attributes._);

    // Initialize values according to the eClass features.
    initValues(this);
    setValues(this, attributes);
    initOperations(this);

    return this;
};

function initValues(eObject) {
    var eClass = eObject.eClass;
    if (!eClass) return;

    var eStructuralFeatures = eClass.get('eAllStructuralFeatures');
    _.each(eStructuralFeatures, function(eFeature) {
        initValue(eObject, eFeature);
    });
}

function initValue(eObject, eFeature) {
    if (!eObject || !eFeature) return;

    var featureName = eFeature.get('name'),
        defaultValue = eFeature.values.defaultValue,
        upperBound = eFeature.get('upperBound'),
        isDerived = eFeature.values.derived === true,
        isContainment = eFeature.values.containment === true,
        value = eObject.values[featureName];

    var setDefaultUniqueValue = function() {
        var _default;
        if (defaultValue === null || defaultValue === undefined) {
            _default = null;
        } else if (defaultValue === 0) {
            _default = 0;
        } else if (defaultValue === false) {
            _default = false;
        } else {
            _default = defaultValue;
        }
        return _default;
    };

    if (value === null || value === undefined) {
        if (isDerived) {
            eObject.values[featureName] = eFeature.values._;
        } else if (upperBound === 1 || !upperBound) {
            eObject.values[featureName] = setDefaultUniqueValue();
        } else if (value instanceof Ecore.EList) {
            value._setFeature(eFeature);
        } else if (eFeature.isTypeOf('EAttribute')) {
            eObject.values[featureName] = [];
        } else {
            eObject.values[featureName] = new Ecore.EList(eObject, eFeature);
        }
    }
}

function getEStructuralFeature(eClass, featureName) {
    return _.find(eClass.get('eAllStructuralFeatures'), function(feature) {
        return feature.values.name === featureName;
    });
}

function setValues(eObject, attributes) {
    if (!eObject.eClass) return;

    var getOrCreate = function(eType, value) {
        if (typeof value === 'function') return value;
        if (value instanceof EObject) return value;
        return Ecore.create(eType, value);
    };

    var createSingle = function(key, value, isReference, eType) {
        if (isReference) {
            eObject.set(key, getOrCreate(eType, value));
        } else {
            eObject.set(key, value);
        }
    };

    var createMany = function(key, value, isReference, eType) {
        var values = _.isArray(value) ? value : [value];
        _.each(values, function(current) {
            if (isReference) {
                eObject.get(key).add(getOrCreate(eType, current));
            } else {
                eObject.get(key).push(current);
            }
        });
    };

    _.each(attributes, function(value, key) {
        var eFeature = getEStructuralFeature(this.eClass, key),
            values = [];

        if (eFeature && value !== undefined) {
            if (eFeature.get('upperBound') === 1) {
                createSingle(key, value, eFeature.eClass === Ecore.EReference, eFeature.get('eType'));
            } else {
                createMany(key, value, eFeature.eClass === EReference, eFeature.get('eType'));
            }
        }
    }, eObject);
}

function eAllOperations(eClass) {
    var eOperations = eClass.get('eOperations').array();
    var superTypes = eClass.get('eAllSuperTypes');
    var all = _.flatten(_.union(eOperations || [], _.map(superTypes || [],
                    function(s) { return eAllOperations(s); })));

    return all;
}

function initOperations(eObject) {
    if (!eObject || !eObject.eClass) return;

    var eOperations = eAllOperations(eObject.eClass);
    if (!eOperations) return;

    _.each(eOperations, function(op) {
        eObject[op.get('name')] = op._;
    });
}


// EObjectPrototype
//
// Prototype object for EObject and EModelElements.

Ecore.EObjectPrototype = {

    setEClass: function(eClass) {
        this.eClass = eClass;
        initValues(this);
        setValues(this, this.values);
        initOperations(this);

        return this;
    },

    create: function(attributes) {
        if (this.eClass.get('name') !== 'EClass') return;

        return Ecore.create(this, attributes);
    },

    // Returns true if property if a feature of the EObject.
    //
    //      @method has
    //      @param {String} name
    //      @return {Boolean}

    has: function(name) {
        return this.values.hasOwnProperty(name) || getEStructuralFeature(this.eClass, name);
    },

    // Returns true if property has its value set.
    //
    //      @method isSet
    //      @param {String} name
    //      @return {Boolean}

    isSet: function(name) {
        if (!this.has(name)) return false;

        var eClass = this.eClass;
        if (!eClass) return false;

        var value = this.get(name);
        if (value instanceof EList) {
            return value.size() > 0;
        } else {
            return value !== null && typeof value !== 'undefined';
        }
    },

    // Setter for the property identified by the first parameter.
    //
    //      @method set
    //      @param {String} name
    //      @param {Object} value
    //      @return {EObject}

    set: function(attrs, options) {
        var attr, key, val, eve;
        if (attrs === null) return this;

        // Handle attrs is a hash or attrs is
        // property and options the value to be set.
        if (!_.isObject(attrs)) {
            key = attrs;
            (attrs = {})[key] = options;
            options = arguments[2];
        }

        var eResource = this.eResource();
        for (attr in attrs) {
            val = attrs[attr];
            if (typeof val !== 'undefined' && this.has(attr)) {
                this.values[attr] = val;
                eve = 'change:' + attr;
                this.trigger('change ' + eve, attr);
                if (eResource) eResource.trigger('change', this);
            }
        }

        return this;
    },

    // Getter for the property identified by the first parameter.
    //
    //      @method get
    //      @param {EStructuralFeature} feature
    //      or
    //      @param {String} feature name
    //      @return {Object}

    get: function(feature) {
        if (!feature) return null;

        var featureName = feature.eClass ? feature.get('name') : feature;

        if (!_.has(this.values, featureName) && this.has(featureName)) {
            initValue(this, getEStructuralFeature(this.eClass, featureName));
        }

        var value = this.values[featureName];

        if (typeof value === 'function') {
            return value.apply(this);
        } else {
            return value;
        }
    },

    // Returns true if the EObject is a direct instance of the EClass.
    //
    //      @method isTypeOf
    //      @param {String} type
    //      @return {Boolean}

    isTypeOf: function(type) {
        if (!type || !this.eClass) return false;

        var typeName = type.eClass ? type.get('name') : type;

        return this.eClass.get('name') === typeName;
    },

    // Returns true if the EObject is an direct instance of the EClass or
    // if it is part of the class hierarchy.
    //
    //      @method isKindOf
    //      @param {String}
    //      @return {Boolean}

    isKindOf: function(type) {
        if(!type || !this.eClass) return false;
        if (this.isTypeOf(type)) return true;

        var typeName = type.eClass ? type.get('name') : type,
            superTypes = this.eClass.get('eAllSuperTypes');

        return _.any(superTypes, function(eSuper) {
            return eSuper.get('name') === typeName;
        });
    },

    // Returns the Resource containing the EObject.
    //
    //      @method eResource
    //      @return {Resource}

    eResource: function() {
        if (this.isKindOf('Resource')) return this;
        if (!this.eContainer) return null;
        if (this.eContainer.isKindOf('Resource')) return this.eContainer;

        return this.eContainer.eResource();
    },

    // Returns the content of an EObject.
    //
    //      @method eContents
    //      @return {Array}

    eContents: function() {
        if (!this.eClass) return [];

        var eAllFeatures = this.eClass.get('eAllStructuralFeatures'),
            eContainments = _.filter(eAllFeatures, function(feature) {
                return feature.isTypeOf('EReference') &&
                    feature.get('containment') &&
                    this.isSet(feature.get('name'));
            }, this);

        return _.flatten(_.map(eContainments, function(c) {
            var value = this.get(c.get('name'));
            return value instanceof Ecore.EList ? value.array() : value;
        }, this));
    },

    // Returns the URI of the EObject.
    //
    // URI is made of the containing Resource URI and EObject
    // identifier has fragment.
    //
    //      @method eURI
    //      @return {String}
    //

    eURI: function() {
        var eModel = this.eResource(),
            current = this;

        return eModel.get('uri') + '#' + this.fragment();
    },

    // Returns the fragment identifier of the EObject.
    //
    //      @return {String}

    fragment: function() {
        var eContainer = this.eContainer,
            eClass = this.eClass,
            iD = eClass.get('eIDAttribute'),
            eFeature,
            contents,
            fragment;

        // Must be at least contain in a Resource or EObject.
        if (!eContainer) return null;

        // Use ID has fragment
        if (iD) return this.get(iD.get('name'));

        // ModelElement uses names except for roots
        if (this.isKindOf('EModelElement')) {
            if (!eContainer) {
                return '/';
            } else if (eContainer.isKindOf('Resource')) {
                contents = eContainer.get('contents');
                return contents.size() > 1 ? '/' + contents.indexOf(this) : '/';
            } else {
                return eContainer.fragment() + '/' + this.get('name');
            }
        }

        // Default fragments
        if (eContainer.isKindOf('Resource')) {
            contents = eContainer.get('contents');
            fragment = contents.size() > 1 ? '/' + contents.indexOf(this) : '/';
        } else {
            eFeature = this.eContainingFeature;
            if (eFeature) {
                fragment = eContainer.fragment() + '/@' + eFeature.get('name');
                if (eFeature.get('upperBound') !== 1) {
                    fragment += '.' + eContainer.get(eFeature.get('name')).indexOf(this);
                }
            }
        }

        return fragment;
    }
};

_.extend(EObject.prototype, Ecore.EObjectPrototype, Events);

// EList, A List implementation.
//
//      @param {EObject} owner - the owner of the feature.
//      @param {EStructuralFeature} feature - the feature associated.

var EList = Ecore.EList = function(owner, feature) {
    this._internal = [];
    this._owner = owner;
    this._size = 0;
    this._setFeature(feature);

    return this;
};

EList.prototype = {

    //  @private

    _setFeature: function(feature) {
        if (feature) {
            this._feature = feature;
            this._isContainment = this._feature.get('containment');

            _.each(this._internal, function(e) {
                if (this._isContainment) {
                    e.eContainer = this._owner;
                    e.eContainingFeature = this._feature;
                }
            }, this);
        }
    },


    // Adds an EObject.
    //
    // @method add
    // @public
    // @param {EObject} eObject
    //

    add: function(eObject) {
        if (!eObject || !eObject instanceof EObject) return this;

        if (this._isContainment) {
            eObject.eContainingFeature = this._feature;
            eObject.eContainer = this._owner;
        }

        this._size++;
        this._internal.push(eObject);

        var eResource = this._owner.eResource(),
            eve = 'add';

        if (this._feature) eve += ':' + this._feature.get('name');
        this._owner.trigger(eve, eObject);
        if (eResource) eResource.trigger('add', this);

        return this;
    },

    // Adds an array
    //
    //      @param {EObject}
    //      @param {Array}

    addAll: function() {
        _.each(_.flatten(arguments || []), function(value) {
            this.add(value);
        }, this);

        return this;
    },

    // Removes given element from the EList
    //
    // @public
    // @param {EObject}

    remove: function(eObject) {
        var eve = 'remove',
            eResource = this._owner.eResource();

        this._internal = _.without(this._internal, eObject);
        this._size = this._size - 1;
        if (this._feature) eve += ':' + this._feature.get('name');
        this._owner.trigger(eve, eObject);
        if (eResource) eResource.trigger('remove', this);

        return this;
    },

    clear: function() {
        var array = this.array();
        for (var i = 0; i < array.length; i++) {
            this.remove(array[i]);
        }
        return this;
    },

    // Returns the size of the EList
    //
    //      @public
    //      @returns {Integer}

    size: function() {
        return this._size;
    },

    // Returns the elment at given index
    //
    //      @public
    //      @param {integer}
    //      @returns {EObject}

    at: function(position) {
        if (this._size < position) {
            throw new Error('Index Out Of Range');
        }
        return this._internal[position];
    },

    // Returns an Array representation of the EList
    //
    //      @returns {Array}

    array: function() {
        return this._internal;
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

//  Bootstrap Ecore Model.

var EClass = new EObject(),
    EString = new EObject(),
    EInt = new EObject(),
    EBoolean = new EObject(),
    EDouble = new EObject(),
    EDate = new EObject(),
    JSObject = new EObject(),
    EClass_abstract = new EObject(),
    EClass_interface = new EObject(),
    EClass_eStructuralFeatures = new EObject(),
    EClass_eOperations = new EObject(),
    EClass_eSuperTypes = new EObject();


// EClass
//  - attributes:
//      - abstract: Boolean
//      - interface: Boolean
//  - references:
//      - eStructuralFeatures: EStructuralFeature
//      - eSuperTypes: EClass
//      - eOperations: EOperation
//  - operations:
//      - isSuperTypeOf(eClass): Boolean
//      - getEStructuralFeature(feature): EStructuralFeature


EClass.eClass = EClass;
EClass.values = {
    name: 'EClass',
    abstract: false,
    'interface': false,
    eStructuralFeatures: new Ecore.EList(EClass),
    eOperations: new Ecore.EList(EClass),
    eSuperTypes: new Ecore.EList(EClass),

    // Derived Features

    eAllSuperTypes: function() {
        if (!this._eAllSuperTypes) {
            var compute = function(eClass) {
                var superTypes = eClass.get('eSuperTypes').array(),
                    eAllSuperTypes = _.flatten(_.map(superTypes, function(s) {
                        return s.get('eAllSuperTypes');
                    }));

                return _.union(eAllSuperTypes, superTypes);
            };

            this.on('add:eSuperTypes remove:eSuperTypes', function() {
                this._eAllSuperTypes = compute(this);
            }, this);

            this._eAllSuperTypes = compute(this);
        }

        return this._eAllSuperTypes;
    },
    eAllSubTypes: function() {
        var eClasses, subTypes;

        eClasses = Ecore.EPackage.Registry.elements('EClass');
        subTypes = _.filter(eClasses, function(c) {
            return _.contains(c.get('eAllSuperTypes'), this);
        }, this);

        return _.isArray(subTypes) ? subTypes : [];
    },
    eReferences: function() {
        var eFeatures, eReferences;

        eFeatures = this.get('eStructuralFeatures');
        eReferences = eFeatures.filter(function(f) {
            return f.isTypeOf('EReference');
        });

        return eReferences;
    },
    eAttributes: function() {
        var eFeatures, eAttributes;

        eFeatures = this.get('eStructuralFeatures');
        eAttributes = eFeatures.filter(function(f) {
            return f.isTypeOf('EAttribute');
        });

        return eAttributes;
    },
    eIDAttribute: function() {
        var eAttributes, eID;

        eAttributes = this.get('eAllAttributes');
        eID = _.filter(eAttributes, function(a) {
            return a.get('iD') === true;
        });

        return _.isArray(eID) ? null : eID;
    },
    eAllStructuralFeatures: function() {
        var compute = function(eClass) {
            var eSuperFeatures, eAllFeatures, eSuperTypes;
            eSuperTypes = eClass.get('eAllSuperTypes');
            eAllFeatures = eClass.values.eStructuralFeatures.array();
            eSuperFeatures = _.flatten(_.map(eSuperTypes || [], function(s) {
                return s.values.eStructuralFeatures.array();
            }));

            return _.union(eSuperFeatures || [], eAllFeatures || []);
        };

        return compute(this);
    },
    eAllAttributes: function() {
        var eAllFeatures = this.get('eAllStructuralFeatures'),
            eAllAttributes = _.filter(eAllFeatures || [], function(f) {
                return f.eClass === Ecore.EAttribute;
            });

        return eAllAttributes;
    },
    eAllContainments: function() {
        var eAllFeatures = this.get('eAllStructuralFeatures'),
            eAllContainments = _.filter(eAllFeatures, function(f) {
                return f.eClass === Ecore.EReference && f.get('containment');
            });

        return eAllContainments;
    },
    eAllReferences: function() {
        var eAllFeatures = this.get('eAllStructuralFeatures'),
            eAllReferences = _.filter(eAllFeatures, function(f) {
                return f.eClass === Ecore.EReference && !f.get('containment');
            });

        return eAllReferences;
    }
};

EClass_abstract.values = {
    name: 'abstract',
    lowerBound: 0,
    upperBound: 1,
    defaultValueLiteral: 'false',
    defaultValue: false,
    eType: EBoolean
};
EClass_interface.values = {
    name: 'interface',
    lowerBound: 0,
    upperBound: 1,
    defaultValueLiteral: 'false',
    defaultValue: false,
    eType: EBoolean
};
EClass_eStructuralFeatures.values = {
    name: 'eStructuralFeatures',
    lowerBound: 0,
    upperBound: -1,
    containment: true
};
EClass_eSuperTypes.values = {
    name: 'eSuperTypes',
    lowerBound: 0,
    upperBound: -1,
    containment: false
};
EClass_eOperations.values = {
    name: 'eOperations',
    lowerBound: 0,
    upperBound: -1,
    containment: true
};
EClass.get('eStructuralFeatures')
    .add(EClass_abstract)
    .add(EClass_interface)
    .add(EClass_eSuperTypes)
    .add(EClass_eStructuralFeatures)
    .add(EClass_eOperations);


// EClass derived features
//  - eAllStructuralFeatures
//  - eAllSuperTypes
//  - eAllSubTypes (added, not in ecore)
//  - eAllAttributes
//  - eAllContainments
//  - eAllReferences
//  - eReferences
//  - eAttributes
//  - eIDAttribute

var EClass_eAllStructuralFeatures = new EObject();
EClass_eAllStructuralFeatures.values = {
    name: 'eAllStructuralFeatures',
    lowerBound: 0,
    upperBound: -1,
    derived: true,
    containment: false,
    _: EClass.values.eAllStructuralFeatures
};
var EClass_eAllSuperTypes = new EObject();
EClass_eAllSuperTypes.values = {
    name: 'eAllSuperTypes',
    lowerBound: 0,
    upperBound: -1,
    derived: true,
    containment: false,
    _: EClass.values.eAllSuperTypes
};
var EClass_eAllSubTypes = new EObject();
EClass_eAllSubTypes.values = {
    name: 'eAllSubTypes',
    lowerBound: 0,
    upperBound: -1,
    derived: true,
    containment: false,
    _: EClass.values.eAllSubTypes
};
var EClass_eAllAttributes = new EObject();
EClass_eAllAttributes.values = {
    name: 'eAllAttributes',
    lowerBound: 0,
    upperBound: -1,
    derived: true,
    containment: false,
    _: EClass.values.eAllAttributes
};
var EClass_eAllContainments = new EObject();
EClass_eAllContainments.values = {
    name: 'eAllContainments',
    lowerBound: 0,
    upperBound: -1,
    derived: true,
    containment: false,
    _: EClass.values.eAllContainments
};
var EClass_eAllReferences = new EObject();
EClass_eAllReferences.values = {
    name: 'eAllReferences',
    lowerBound: 0,
    upperBound: -1,
    derived: true,
    containment: false,
    _: EClass.values.eAllReferences
};
var EClass_eReferences = new EObject();
EClass_eReferences.values = {
    name: 'eReferences',
    lowerBound: 0,
    upperBound: -1,
    derived: true,
    containment: false,
    _: EClass.values.eReferences
};
var EClass_eAttributes = new EObject();
EClass_eAttributes.values = {
    name: 'eAttributes',
    lowerBound: 0,
    upperBound: -1,
    derived: true,
    containment: false,
    _: EClass.values.eAttributes
};
var EClass_eIDAttribute = new EObject();
EClass_eIDAttribute.values = {
    name: 'eIDAttribute',
    lowerBound: 0,
    upperBound: 1,
    derived: true,
    containment: false,
    _: EClass.values.eIDAttribute
};

EClass.get('eStructuralFeatures')
    .add(EClass_eAllStructuralFeatures)
    .add(EClass_eAllSuperTypes)
    .add(EClass_eAllSubTypes)
    .add(EClass_eAllAttributes)
    .add(EClass_eAllReferences)
    .add(EClass_eAllContainments)
    .add(EClass_eAttributes)
    .add(EClass_eReferences)
    .add(EClass_eIDAttribute);

// EClass EOperations

EClass.getEStructuralFeature = function(feature) {
    var featureName;

    featureName = feature.eClass ? feature.get('name') : feature;

    return _.find(this.get('eAllStructuralFeatures'), function(f) {
        return f.get('name') === featureName;
    });
};

var EClass_getEStructuralFeature = new EObject();
EClass_getEStructuralFeature.values = {
    name: 'getEStructuralFeature',
    lowerBound: 0,
    upperBound: 1,
    eParameters: new Ecore.EList(this)
};
EClass_getEStructuralFeature._ = EClass.getEStructuralFeature;

EClass.get('eOperations').add(EClass_getEStructuralFeature);

// Setting feature reference for ELists.
EClass.values.eStructuralFeatures._setFeature(EClass_eStructuralFeatures);
EClass.values.eSuperTypes._setFeature(EClass_eSuperTypes);
EClass.values.eOperations._setFeature(EClass_eOperations);

// Initialize remaining EClasses

var EObjectClass = EClass.create(),
    EModelElement = EClass.create(),
    EAnnotation = EClass.create(),
    ENamedElement = EClass.create(),
    EPackage = EClass.create(),
    EClassifier = EClass.create(),
    EDataType = EClass.create(),
    EEnum = EClass.create(),
    ETypedElement = EClass.create(),
    EStructuralFeature = EClass.create(),
    EAttribute = EClass.create(),
    EReference = EClass.create(),
    EOperation = EClass.create(),
    EParameter = EClass.create(),
    EEnumLiteral = EClass.create();

// Set eClass and necessary values for EClass features.

// abstract
EClass_abstract.eClass = EAttribute;
// interface
EClass_interface.eClass = EAttribute;
// eStructuralFeatures
EClass_eStructuralFeatures.eClass = EReference;
EClass_eStructuralFeatures.values.eType = EStructuralFeature;
// eSuperTypes
EClass_eSuperTypes.eClass = EReference;
EClass_eSuperTypes.values.eType = EClass;
// eOperations
EClass_eOperations.eClass = EReference;
EClass_eOperations.values.eType = EOperation;
// eAllStructuralFeatures
EClass_eAllStructuralFeatures.eClass = EReference;
EClass_eAllStructuralFeatures.values.eType = EStructuralFeature;
// eAllSuperTypes
EClass_eAllSuperTypes.eClass = EReference;
EClass_eAllSuperTypes.values.eType = EClass;
// eAllSubTypes
EClass_eAllSubTypes.eClass = EReference;
EClass_eAllSubTypes.values.eType = EClass;
// eAllAttributes
EClass_eAllAttributes.eClass = EReference;
EClass_eAllAttributes.values.eType = EAttribute;
// eAllReferences
EClass_eAllReferences.eClass = EReference;
EClass_eAllReferences.values.eType = EReference;
// eAllContainments
EClass_eAllContainments.eClass = EReference;
EClass_eAllContainments.values.eType = EReference;
// eAttributes
EClass_eAttributes.eClass = EReference;
EClass_eAttributes.values.eType = EAttribute;
// eReferences
EClass_eReferences.eClass = EReference;
EClass_eReferences.values.eType = EReference;
// eIDAttribute
EClass_eIDAttribute.eClass = EReference;
EClass_eIDAttribute.values.eType = EAttribute;
// getEStructuralFeature
EClass_getEStructuralFeature.eClass = EOperation;
EClass_getEStructuralFeature.values.eType = EStructuralFeature;

// Set Types Hierarchy.
EModelElement.get('eSuperTypes').add(EObjectClass);
EAnnotation.get('eSuperTypes').add(EModelElement);
ENamedElement.get('eSuperTypes').add(EModelElement);
EPackage.get('eSuperTypes').add(ENamedElement);
EClassifier.get('eSuperTypes').add(ENamedElement);
EClass.get('eSuperTypes').add(EClassifier);
EDataType.get('eSuperTypes').add(EClassifier);
EEnum.get('eSuperTypes').add(EDataType);
EEnumLiteral.get('eSuperTypes').add(ENamedElement);
ETypedElement.get('eSuperTypes').add(ENamedElement);
EStructuralFeature.get('eSuperTypes').add(ETypedElement);
EAttribute.get('eSuperTypes').add(EStructuralFeature);
EReference.get('eSuperTypes').add(EStructuralFeature);
EOperation.get('eSuperTypes').add(ETypedElement);
EParameter.get('eSuperTypes').add(ETypedElement);

// ETypedElement
//  - attributes:
//      - ordered: Boolean
//      - unique: Boolean
//      - lowerBound: Integer
//      - upperBound: Integer
//      - many: Boolean
//      - required: Boolean
//  - references:
//      - eType: EClassifier

var ETypedElement_eType = new EObject(),
    ETypedElement_ordered = new EObject(),
    ETypedElement_unique = new EObject(),
    ETypedElement_lowerBound = new EObject(),
    ETypedElement_upperBound = new EObject(),
    ETypedElement_many = new EObject(),
    ETypedElement_required = new EObject();

ETypedElement_eType.eClass = EReference;
ETypedElement_eType.values = {
    name: 'eType',
    lowerBound: 0,
    upperBound: 1,
    containment: false,
    eType: EClassifier
};
ETypedElement_ordered.eClass = EAttribute;
ETypedElement_ordered.values = {
    name: 'ordered',
    lowerBound: 0,
    upperBound: 1,
    defaultValueLiteral: 'true',
    defaultValue: true,
    eType: EBoolean
};
ETypedElement_unique.eClass = EAttribute;
ETypedElement_unique.values = {
    name: 'unique',
    lowerBound: 0,
    upperBound: 1,
    defaultValueLiteral: 'true',
    defaultValue: true,
    eType: EBoolean
};
ETypedElement_lowerBound.eClass = EAttribute;
ETypedElement_lowerBound.values = {
    name: 'lowerBound',
    lowerBound: 0,
    upperBound: 1,
    defaultValueLiteral: '0',
    defaultValue: 0,
    eType: EInt
};
ETypedElement_upperBound.eClass = EAttribute;
ETypedElement_upperBound.values = {
    name: 'upperBound',
    lowerBound: 0,
    upperBound: 1,
    defaultValueLiteral: '1',
    defaultValue: 1,
    eType: EInt
};
ETypedElement_many.eClass = EAttribute;
ETypedElement_many.values = {
    name: 'many',
    lowerBound: 0,
    upperBound: 1,
    eType: EBoolean,
    derived: true,
    _: function() {
        return this.get('upperBound') !== 1;
    }
};
ETypedElement_required.eClass = EAttribute;
ETypedElement_required.values = {
    name: 'required',
    lowerBound: 0,
    upperBound: 1,
    eType: EBoolean,
    derived: true,
    _: function() {
        return this.get('lowerBound') === 1;
    }
};

ETypedElement.get('eStructuralFeatures')
    .add(ETypedElement_eType)
    .add(ETypedElement_ordered)
    .add(ETypedElement_unique)
    .add(ETypedElement_lowerBound)
    .add(ETypedElement_upperBound)
    .add(ETypedElement_many)
    .add(ETypedElement_required);

// EModelElement
//  - references:
//      - eAnnotations
//  - operations:
//      - getEAnnotation(source): EAnnotation

var EModelElement_eAnnotations = new EObject();
EModelElement_eAnnotations.eClass = EReference;
EModelElement_eAnnotations.values = {
    name: 'eAnnotations',
    eType: EAnnotation,
    lowerBound: 0,
    upperBound: -1,
    containment: true
};

EModelElement.get('eStructuralFeatures').add(EModelElement_eAnnotations);

// ENamedElement
// - attributes
//   - name: EString

var ENamedElement_name = new EObject();
ENamedElement_name.eClass = EAttribute;
ENamedElement_name.values = {
    name: 'name',
    lowerBound: 0,
    upperBound: 1,
    eType: EString
};

ENamedElement.get('eStructuralFeatures').add(ENamedElement_name);

// EClassifier
//  - references:
//      - ePackages[*]: EPackage

// EStructuralFeature
//  - attributes:
//      - changeable: Boolean
//      - volatile: Boolean
//      - transient: Boolean
//      - defaultValueLiteral: String
//      - defaultValue: Object
//      - unsettable: Boolean
//      - derived: Boolean

var EStructuralFeature_changeable = EAttribute.create({ name: 'changeable', eType: EBoolean }),
    EStructuralFeature_volatile = EAttribute.create({ name: 'volatile', eType: EBoolean }),
    EStructuralFeature_transient = EAttribute.create({ name: 'transient', eType: EBoolean }),
    EStructuralFeature_defaultValueLiteral = EAttribute.create({ name: 'defaultValueLiteral', eType: EString }),
    EStructuralFeature_defaultValue = EAttribute.create({ name: 'defaultValue', eType: JSObject, derived: true }),
    EStructuralFeature_unsettable = EAttribute.create({ name: 'unsettable', eType: EBoolean }),
    EStructuralFeature_derived = EAttribute.create({ name: 'derived', eType: EBoolean });

EStructuralFeature.get('eStructuralFeatures')
    .add(EStructuralFeature_changeable)
    .add(EStructuralFeature_volatile)
    .add(EStructuralFeature_transient)
    .add(EStructuralFeature_defaultValueLiteral)
    .add(EStructuralFeature_defaultValue)
    .add(EStructuralFeature_unsettable)
    .add(EStructuralFeature_derived);

EStructuralFeature_defaultValue.set({ derived: true });

// EReference
//  - attributes
//      - containment
//      - container
//      - resolveProxies
//  - references
//      - eOpposite

var EReference_containment = EAttribute.create({ name: 'containment', eType: EBoolean }),
    EReference_container = EAttribute.create({ name: 'container', eType: EBoolean }),
    EReference_resolveProxies = EAttribute.create({ name: 'resolveProxies', eType: EBoolean }),
    EReference_eOpposite = EReference.create({ name: 'eOpposite', eType: EReference });

EReference.get('eStructuralFeatures')
    .add(EReference_containment)
    .add(EReference_container)
    .add(EReference_resolveProxies)
    .add(EReference_eOpposite);

// EAttribute
//  - attributes
//      - iD: Boolean

var EAttribute_iD = EAttribute.create({ name: 'iD', eType: EBoolean });
EAttribute.get('eStructuralFeatures').add(EAttribute_iD);

// Set attributes values for EClasses.

EObjectClass.set({ name: 'EObject' });
EModelElement.set({ name: 'EModelElement', abstract: true });
EAnnotation.set({ name: 'EAnnotation' });
ENamedElement.set({ name: 'ENamedElement', abstract: true });
EPackage.set({ name: 'EPackage' });
EClassifier.set({ name: 'EClassifier', abstract: true });
EDataType.set({ name: 'EDataType' });
EEnum.set({ name: 'EEnum' });
ETypedElement.set({ name: 'ETypedElement', abstract: true });
EStructuralFeature.set({ name: 'EStructuralFeature', abstract: true });
EAttribute.set({ name: 'EAttribute' });
EReference.set({ name: 'EReference' });
EOperation.set({ name: 'EOperation' });
EParameter.set({ name: 'EParameter' });
EEnumLiteral.set({ name: 'EEnumLiteral' });

// EOperation
//

var EOperation_eParameters = EReference.create({
    name: 'eParameters',
    eType: EParameter,
    containment: true,
    lowerBound: 0,
    upperBound: -1
});

EOperation.get('eStructuralFeatures').add(EOperation_eParameters);

var EEnum_eLiterals = EReference.create({
    name: 'eLiterals',
    eType: EEnumLiteral,
    containment: true,
    lowerBound: 0,
    upperBound: -1
});

EEnum.get('eStructuralFeatures').add(EEnum_eLiterals);

EEnumLiteral.get('eStructuralFeatures')
    .add(EAttribute.create({ name: 'literal', eType: EString }))
    .add(EAttribute.create({ name: 'value', eType: EInt }));

// EStringToStringMapEntry
//  - attributes
//    - key: EString
//    - value: EString

var EStringToStringMapEntry = EClass.create({
    name: 'EStringToStringMapEntry'
});

var EStringToStringMapEntry_key = EAttribute.create({
    name: 'key',
    lowerBound: 0,
    upperBound: 1,
    eType: EString
});

var EStringToStringMapEntry_value = EAttribute.create({
    name: 'value',
    lowerBound: 0,
    upperBound: 1,
    eType: EString
});

EStringToStringMapEntry.get('eStructuralFeatures')
    .add(EStringToStringMapEntry_key)
    .add(EStringToStringMapEntry_value);

// EAnnotation
// - attributes:
//  - source: EString
// - references:
//  - details[*]: EStringToStringMapEntry

var EAnnotation_source = EAttribute.create({
    name: 'source',
    upperBound: 1,
    lowerBound: 0,
    eType: EString
});
var EAnnotation_details = EReference.create({
    name: 'details',
    upperBound: -1,
    lowerBound: 0,
    containment: true,
    eType: EStringToStringMapEntry
});

EAnnotation.get('eStructuralFeatures')
    .add(EAnnotation_source)
    .add(EAnnotation_details);


// Setting core datatypes values

EString.eClass = EDataType;
EString.set({ name: 'EString' });
EInt.eClass = EDataType;
EInt.set({ name: 'EInt' });
EBoolean.eClass = EDataType;
EBoolean.set({ name: 'EBoolean' });
EDate.eClass = EDataType;
EDate.set({ name: 'EDate' });
EDouble.eClass = EDataType;
EDouble.set({ name: 'EDouble' });
JSObject.eClass = EDataType;
JSObject.set({ name: 'JSObject' });

// Additional datatypes

Ecore.ELong = EDataType.create({
    name: 'ELong'
});
Ecore.EFloat = EDataType.create({
    name: 'EFloat'
});
Ecore.EShort = EDataType.create({
    name: 'EShort'
});

// EPackage
//  - references
//      - eClassifiers

var EPackage_eClassifiers = EReference.create({
    name: 'eClassifiers',
    lowerBound: 0,
    upperBound: -1,
    containment: true,
    eType: EClassifier
});

var EPackage_eSubPackages = EReference.create({
    name: 'eSubPackages',
    lowerBound: 0,
    upperBound: -1,
    containment: true,
    eType: EPackage
});

EPackage.get('eStructuralFeatures')
    .add(EAttribute.create({ name: 'nsURI', eType: EString }))
    .add(EAttribute.create({ name: 'nsPrefix', eType: EString }))
    .add(EPackage_eClassifiers)
    .add(EPackage_eSubPackages);

// EcorePackage

Ecore.EcorePackage = EPackage.create({
    name: 'ecore',
    nsPrefix: 'ecore',
    nsURI: 'http://www.eclipse.org/emf/2002/Ecore'
});

Ecore.EcorePackage.get('eClassifiers')
    .add(EObjectClass)
    .add(EModelElement)
    .add(EAnnotation)
    .add(ENamedElement)
    .add(EPackage)
    .add(EClassifier)
    .add(EClass)
    .add(EDataType)
    .add(ETypedElement)
    .add(EStructuralFeature)
    .add(EAttribute)
    .add(EReference)
    .add(EOperation)
    .add(EParameter)
    .add(EEnum)
    .add(EEnumLiteral)
    .add(EStringToStringMapEntry)
    .add(EString)
    .add(EBoolean)
    .add(EInt)
    .add(EDouble)
    .add(EDate)
    .add(Ecore.EShort)
    .add(Ecore.EFloat)
    .add(Ecore.ELong)
    .add(JSObject);

Ecore.EObject = EObjectClass;
Ecore.EModelElement = EModelElement;
Ecore.EClass = EClass;
Ecore.EClassifier = EClassifier;
Ecore.EAnnotation = EAnnotation;
Ecore.EStringToStringMapEntry = EStringToStringMapEntry;
Ecore.EPackage = EPackage;
Ecore.ETypedElement = ETypedElement;
Ecore.ENamedElement = ENamedElement;
Ecore.EStructuralFeature = EStructuralFeature;
Ecore.EAttribute = EAttribute;
Ecore.EReference = EReference;
Ecore.EEnum = EEnum;
Ecore.EEnumLiteral = EEnumLiteral;
Ecore.EDataType = EDataType;
Ecore.EOperation = EOperation;
Ecore.EParameter = EParameter;
Ecore.EString = EString;
Ecore.EBoolean = EBoolean;
Ecore.EInt = EInt;
Ecore.EDouble = EDouble;
Ecore.EDate = EDate;
Ecore.JSObject = JSObject;

// EPackage Registry
//
// Stores all created EPackages

Ecore.EPackage.Registry = {

    _ePackages: {},

    getEPackage: function(nsURI) {
        return this._ePackages[nsURI];
    },

    register: function(ePackage) {
        if (!ePackage.isSet('nsURI')) {
            throw new Error('Cannot register EPackage without nsURI');
        }

        ePackage.get('eSubPackages').each(function(ePackage) {
            register(ePackage)
        });

        this._ePackages[ePackage.get('nsURI')] = ePackage;
    },

    ePackages: function() {
        return _.values(this._ePackages);
    },

    elements: function(type) {
        var filter = function(el) {
            if (!type) return true;
            else if (type.eClass) {
                return el.eClass === type;
            } else {
                return el.eClass.get('name') === type;
            }
        };

        var ePackages = this.ePackages();
        var content = function(eObject) {
            return _.map(eObject.eContents(), function(c) {
                return [c, content(c)];
            });
        };
        var map = function(p) { return content(p); };
        var contents = [ePackages, _.map(ePackages, map)];
        contents = _.flatten(contents);
        contents = _.filter(contents, filter);

        return contents;
    }

};

// Registers Ecore Package

Ecore.EPackage.Registry.register(Ecore.EcorePackage);



Ecore.$ = root.jQuery || root.Zepto || root.ender || null;

// Ajax interface

var Ajax = {

    get: function(url, type, success, error) {
        if (!Ecore.$) return;

        return Ecore.$.ajax({
            url: url,
            dataType: type,
            success: success,
            error: error
        });
    },

    post: function(url, data, type, success, error) {
        if (!Ecore.$) return;

        return Ecore.$.ajax({
           type: 'POST',
           url: url,
           dataType: type,
           data: data,
           success: success,
           error: error
        });
    }

};

// JSON serializer and parser for EMF.
//
// See https://github.com/ghillairet/emfjson for details
// about the JSON format used for EMF Models.
//
//

Ecore.JSON = {

    dataType: 'json',
    contentType: 'application/json',

    parse: function(model, data) {
        var toResolve = [],
            resourceSet = model.get('resourceSet') || Ecore.ResourceSet.create();

        function processFeature(object, eObject) {
            if (!object || !eObject)
                return function( feature ) {};

            return function( feature ) {
                if (feature.get('derived')) return;

                var featureName = feature.get('name'),
                    value = object[featureName];

                if (typeof value !== 'undefined') {
                    if ( feature.isTypeOf('EAttribute') ) {
                        eObject.set( featureName, value );
                    } else if (feature.get('containment')) {
                        if (feature.get('upperBound') === 1) {
                            eObject.set( featureName, parseObject(value) );
                        } else {
                            _.each(value || [], function(val) {
                                eObject.get( featureName ).add( parseObject(val) );
                            });
                        }
                    } else {
                        toResolve.push({ parent: eObject, feature: feature, value: value });
                    }
                }
            };
        }

        function isLocal(uri) {
            return uri.substring(0, 1) === '/';
        }

        function resolveReferences() {
            var index = buildIndex(model);

            function setReference(parent, feature, value, isMany) {
                var ref = value.$ref,
                    resolved;

                if (isLocal(ref)) {
                    resolved = index[ref];
                } else {
                    resolved = resourceSet.getEObject(ref);
                }

                if (resolved) {
                    if (isMany) {
                        parent.get(feature.get('name')).add(resolved);
                    } else {
                        parent.set(feature.get('name'), resolved);
                    }
                }
            }

            _.each(toResolve, function(resolving) {
                var parent = resolving.parent,
                    feature = resolving.feature,
                    value = resolving.value;

                if (feature.get('upperBound') === 1) {
                    setReference(parent, feature, value, false);
                } else {
                    _.each(value, function(val) {
                        setReference(parent, feature, val, true);
                    });
                }
            });
        }

        function parseObject(object) {
            var eObject;

            if (object && object.eClass) {
                var eClass = resourceSet.getEObject(object.eClass),
                    features = eClass.get('eAllStructuralFeatures');

                eObject = Ecore.create(eClass);

                _.each( features, processFeature(object, eObject) );
            }

            return eObject;
        }

        if (_.isArray(data)) {
            _.each(data, function (object) {
                model.add(parseObject(object));
            });
        } else {
            model.add(parseObject(data));
        }

        resolveReferences();
    },

    to: function(model) {
        var contents = model.get('contents').array(),
            indexes = {};
            indexes[model.get('uri')] = buildIndex(model);

        function uri(owner, value) {
            var valueModel = value.eResource(),
                ownerModel = owner.eResource(),
                external = valueModel !== ownerModel;

            if (!valueModel || !ownerModel) return;
            if (!indexes[valueModel.get('uri')]) {
                indexes[valueModel.get('uri')] = buildIndex(valueModel);
            }

            var index = indexes[valueModel.get('uri')];
            for (var key in index) {
                if (index[key] === value) {
                    return external ? valueModel.get('uri') + '#' + key : key;
                }
            }

            return null;
        }

        function processValue(object, value, isContainment) {
            if (isContainment === true) {
                return jsonObject(value);
            } else {
               return { '$ref': uri(object, value), 'eClass': value.eClass.eURI() };
            }
        }

        function processFeature( object, data ) {
            if (!object || !data) return function() {};

            return function( num, key ) {
                if (key[0] === '_') return;
                var feature = object.eClass.getEStructuralFeature(key),
                    isSet = object.isSet(key);

                if (!feature || !isSet || feature.get('derived')) return;

                var value = num,
                    featureName = feature.get('name'),
                    isMany = feature.get('upperBound') !== 1,
                    isContainment = feature.get('containment');

                if (feature.isTypeOf('EAttribute')) {
                    data[featureName] = value;
                } else {
                    if (isMany) {
                        data[featureName] = [];
                        value.each(function(val) {
                            data[featureName].push( processValue(object, val, isContainment) );
                        });
                    } else {
                        data[featureName] = processValue(object, value, isContainment);
                    }
                }
            };
        }

        function jsonObject(object) {
            var eClass = object.eClass,
                values = object.values,
                data = { eClass: eClass.eURI() };

            _.each( values, processFeature(object, data) );

            return data;
        }

        var data;
        if (contents.length === 1) {
            var eObject = contents[0];
            data = jsonObject(eObject);
        } else {
            data = [];
            for (var i = 0; i < contents.length; i++) {
                data.push(jsonObject(contents[i]));
            }
        }
        return data;
    }

};

// Resource

var EClassResource = Ecore.Resource = Ecore.EClass.create({
    name: 'Resource',
    eSuperTypes: [
        Ecore.EObject
    ],
    eStructuralFeatures: [
        {
            eClass: Ecore.EAttribute,
            name: 'uri',
            lowerBound: 1,
            upperBound: 1,
            eType: Ecore.EString
        },
        {
            eClass: Ecore.EReference,
            name: 'contents',
            upperBound: -1,
            containment: true,
            eType: Ecore.EObject
        },
        {
            eClass: Ecore.EReference,
            name: 'resourceSet',
            upperBound: 1,
            lowerBound: 0,
            eType: Ecore.ResourceSet
        }
    ],
    eOperations: [
        {
            eClass: Ecore.EOperation,
            name: 'add',
            _: function(eObject) {
                if (!eObject && !eObject.eClass) return this;

                eObject.eContainer = this;
                this.get('contents').add(eObject);

                return this;
            }
        },
        {
            eClass: Ecore.EOperation,
            name: 'clear',
            _: function() {
                this.get('contents').clear();
                return this;
            }
        },
        {
            eClass: Ecore.EOperation,
            name: 'addAll',
            _: function(content) {
                if (_.isArray(content)) {
                    _.each(content, function(eObject) {
                        this.add(eObject);
                    }, this);
                }

                return this;
            }
        },
        {
            eClass: Ecore.EOperation,
            name: 'getEObject',
            eType: Ecore.EObject,
            _: function(fragment) {
                if (!fragment) return null;

                return buildIndex(this)[fragment];
            }
        },
        {
            eClass: Ecore.EOperation,
            name: 'each',
            _: function(iterator, context) {
                return this.get('contents').each(iterator, context);
            }
        },
        {
            eClass: Ecore.EOperation,
            name: 'to',
            _: function(formatter, indent) {
                if (formatter && typeof formatter.to === 'function')
                    return formatter.to(this, indent);
                else
                    return Ecore.JSON.to(this);
            }
        },
        {
            eClass: Ecore.EOperation,
            name: 'parse',
            _: function(data, loader) {
                if (loader && typeof loader.parse === 'function')
                    loader.parse(this, data);
                else
                    Ecore.JSON.parse(this, data);
                return this;
            }
        },
        {
            eClass: Ecore.EOperation,
            name: 'save',
            _: function(success, error, options) {
                options || (options = {});

                var formatter = options.format ? options.format : Ecore.JSON;
                var data = this.to(formatter);
                var dataType = formatter.dataType;
                var set = this.get('resourceSet');
                var converter = set ? set.uriConverter() : null;
                var uri = this.get('uri');
                uri = converter ? converter.normalize(uri) : uri;

                Ajax.post(uri, data, dataType, success, error);
            }
        },
        {
            eClass: Ecore.EOperation,
            name: 'load',
            _: function(success, error, options) {
                options || (options = {});

                var model = this;
                var loader = options.format || Ecore.JSON;
                var set = this.get('resourceSet');
                var converter = set ? set.uriConverter() : null;
                var uri = this.get('uri');
                var loadSuccess = function(data) {
                    model.parse(data, loader);
                    model.trigger('change');

                    if (typeof success === 'function')
                        return success(model);
                };

                if (options.data) {
                    return loadSuccess(options.data);
                } else {
                    if (set && set.isSet('uri')) {
                        uri = set.get('uri') + '/' + uri;
                    }
                    uri = converter ? converter.normalize(uri) : uri;
                    return Ajax.get(uri, loader.dataType, loadSuccess, error);
                }
            }
        },
        {
            eClass: Ecore.EOperation,
            name: 'remove',
            _: function() {
                var resourceSet = this.get('resourceSet');
                if (resourceSet) {
                    resourceSet.get('resources').remove(this);
                }
                this.clear();
            }
        },
        {
            eClass: Ecore.EOperation,
            name: '_index',
            eType: JSObject,
            _: function() {
                return buildIndex(this);
            }
        }
    ]
});


// URIConverter
//

var URIConverter = function() {
    this.uriMap = {};
};

URIConverter.prototype = {

    map: function(key, value) {
        this.uriMap[key] = value;
    },

    normalize: function(uri) {
        var split = uri.split('#'),
            base = split[0],
            normalized = this.uriMap[base];

        if (normalized) return normalized;

        var slashIndex = base.lastIndexOf('/') + 1,
            sliced, rest;

        sliced = base.slice(0, slashIndex);

        if (sliced === base) return uri;

        rest = base.slice(slashIndex, base.length);

        return this.normalize(sliced) + rest;
    }

};

// ResourceSet
//

var EClassResourceSet = Ecore.ResourceSet = Ecore.EClass.create({
    name: 'ResourceSet',
    eSuperTypes: [
        Ecore.EObject
    ],
    eStructuralFeatures: [
        {
            eClass: Ecore.EAttribute,
            name: 'uri',
            upperBound: 1,
            lowerBound: 0,
            eType: Ecore.EString
        },
        {
            eClass: Ecore.EReference,
            name: 'resources',
            upperBound: -1,
            containment: true,
            eType: EClassResource
        }
    ],
    eOperations: [
        {
            eClass: Ecore.EOperation,
            eType: Ecore.Resource,
            upperBound: 1,
            name: 'create',
            _: function(uri) {
                var attrs = _.isObject(uri) ? uri : { uri: uri },
                    ePackage, resource;

                if (!attrs.uri)
                    throw new Error('Cannot create Resource, missing URI parameter');

                resource = this.get('resources').find(function(e) {
                    return e.get('uri') === attrs.uri;
                });

                if (resource) return resource;

                ePackage = Ecore.EPackage.Registry.getEPackage(attrs.uri);
                if (ePackage) {
                    if (ePackage.eResource()) {
                        resource = ePackage.eResource();
                        resource.set('resourceSet', this);
                        this.get('resources').add(resource);
                    } else {
                        resource = Ecore.Resource.create(attrs);
                        resource.add(ePackage);
                        resource.set('resourceSet', this);
                        this.get('resources').add(resource);
                    }

                    return resource;
                }

                resource = Ecore.Resource.create(attrs);
                resource.set('resourceSet', this);
                this.get('resources').add(resource);

                this.trigger('add', resource);

                return resource;
            }
        },
        {
            eClass: Ecore.EOperation,
            eType: Ecore.EObject,
            upperBound: 1,
            name: 'getEObject',
            _: function(uri) {
                var split = uri.split('#'),
                    base = split[0],
                    fragment = split[1],
                    resource;

                if (!fragment) return null;

                resource = this.get('resources').find(function(e) {
                    return e.get('uri') === base;
                });

                if (!resource) {
                    var ePackage = Ecore.EPackage.Registry.getEPackage(base);
                    if (ePackage) {
                        if (!ePackage.eResource()) {
                            var ePackageResource = this.create({ uri: base });
                            ePackageResource.add(ePackage);
                        }
                        ePackage.eResource().set('resourceSet', this);
                        this.get('resources').add(ePackage.eResource());
                        return this.getEObject(uri);
                    } else {
                        return null;
                    }
                } else {
                    return resource.getEObject(fragment);
                }
            }
        },
        {
            eClass: Ecore.EOperation,
            eType: Ecore.EObject,
            upperBound: -1,
            name: 'elements',
            _: function(type) {
                var filter = function(el) {
                    return !type ? true : el.isKindOf(type);
                };
                var contents = this.get('resources').map(function(m) {
                    return _.filter(_.values(m._index()), filter);
                });
                return _.flatten(contents);
            }
        },
        {
            eClass: Ecore.EOperation,
            eType: Ecore.JSObject,
            upperBound: 1,
            name: 'uriConverter',
            _: function() {
                if (!this._converter) {
                    this._converter = new URIConverter();
                }

                return this._converter;
            }
        },
        {
            eClass: Ecore.EOperation,
            eType: Ecore.JSObject,
            upperBound: 1,
            name: 'toJSON',
            _: function() {
                var result = { total: this.get('resources').size(), resources: [] };

                this.get('resources').each(function(resource) {
                    result.resources.push({
                        uri: resource.get('uri'),
                        length: resource.get('contents').size(),
                        contents: resource.get('contents').map(function(c) {
                            return { eURI: c.eURI(), eClass: c.eClass.eURI() };
                        })
                    });
                });

                return result;
            }
        },
        {
            eClass: Ecore.EOperation,
            name: 'parse',
            _: function(data) {
                if (!data || !data.resources) return;

                _.each(data.resources, function(resource) {
                    if (resource.uri) {
                        resourceSet.create({ uri: resource.uri });
                    }
                }, this);
            }
        },
        {
            eClass: Ecore.EOperation,
            name: 'fetch',
            _: function(success, error) {
                var uri = this.get('uri');
                if (!uri) return;
                var set = this;
                var loadSuccess = function(data) {
                    set.parse(data);
                    set.trigger('change');

                    if (typeof success === 'function')
                        return success(set);
                };
                Ajax.get(uri, Ecore.JSON.dataType, loadSuccess, error);
            }
        }
    ]
});

EClassResource.getEStructuralFeature('resourceSet').set('eType', EClassResourceSet);

var EPackageResource = Ecore.EPackage.create({
    name: 'resources',
    nsPrefix: 'resources',
    nsURI: 'http://www.eclipselabs.org/ecore/2012/resources',
    eClassifiers: [
        EClassResourceSet,
        EClassResource
    ]
});

var EcoreResource = Ecore.Resource.create({ uri: Ecore.EcorePackage.get('nsURI') });
EcoreResource.add(Ecore.EcorePackage);
var ResourceResource = Ecore.Resource.create({ uri: EPackageResource.get('nsURI') });
ResourceResource.add(EPackageResource);

Ecore.EPackage.Registry.register(EPackageResource);

// Build index of EObjects contained in a Resource.
//
// The index keys are the EObject's fragment identifier, the
// values are the EObjects.
//

function buildIndex(model) {
    var index = {},
        contents = model.get('contents').array();

    if (contents.length) {
        var build = function(object, idx) {
            var eContents = object.eContents();
            index[idx] = object;

            _.each(eContents, function(e) { build(e, e.fragment()); });
        };

        var root, iD;
        if (contents.length === 1) {
            root = contents[0];
            iD = root.eClass.get('eIDAttribute') || null;
            if (iD) {
                build(root, root.get(iD.name));
            } else {
                build(root, '/');
            }
        } else {
            for (var i = 0; i < contents.length; i++) {
                root = contents[i];
                iD = root.eClass.get('eIDAttribute') || null;
                if (iD) {
                    build(root, root.get(iD.name));
                } else {
                    build(root, '/' + i);
                }
            }
        }
    }

    return index;
}



function isNotAbstract(type) {
    return !type.get('abstract');
}

function getSubTypes(type) {
    if (!type || !type.eClass) return [];

    var allSubTypes = type.get('eAllSubTypes');

    return _.filter(_.union([type], allSubTypes), isNotAbstract);
}

function childTypes(object, createDescriptor) {
    if (!object) return [];

    var allContainments = object.eClass.get('eAllContainments');
    var allSubTypes = function(feature) {
        var types = getSubTypes(feature.get('eType'));

        if (createDescriptor && typeof createDescriptor === 'function') {
            return createDescriptor(object, feature, types);
        } else {
            return types;
        }
    }

    return _.flatten(_.map(allContainments, allSubTypes));
}

function siblingTypes(object, createDescriptor) {
    if (!object) return [];

    var eContainer = object.eContainer;
    var siblings = childTypes(eContainer, createDescriptor);

    return siblings;
}

function createDescriptor(object, feature, types) {
    return _.map(types, function(type) {
        return {
            label: 'New ' + type.get('name'),
            owner: object,
            feature: feature,
            type: type
        }
    });
};

function childDescriptors(object) {
    return childTypes(object, createDescriptor);
}

function siblingDescriptors(object) {
    return siblingTypes(object, createDescriptor);
}

function textNamedElement(object) {
    return object.get('name') || '';
}

function textTypedElement(object) {
    var type = object.get('eType');
    var isOp = object.eClass === Ecore.EOperation;
    var typeName = type ? type.get('name') : null;

    return object.get('name') + (isOp ? '()' : '') + (typeName ? ' : ' + typeName : '');
}

function choiceOfValues(owner, feature) {
    if (owner == null || owner.eResource() == null || owner.eResource().get('resourceSet') == null)
        throw new Error('Bad argument');

    var type = feature.get('eType');
    var resourceSet = owner.eResource().get('resourceSet');
    var elements = resourceSet.elements();

    return _.filter(elements, function(e) {
        return e.isKindOf(type);
    });
}

Ecore.Edit = {

    childTypes: childTypes,
    siblingTypes: siblingTypes,
    childDescriptors: childDescriptors,
    siblingDescriptors: siblingDescriptors,
    choiceOfValues: choiceOfValues,

    _get: function(fn, object) {
        if (!object || !object.eClass) return null;

         var eClass = object.eClass.get('name');
         if (this[eClass]) {
             if (typeof this[eClass][fn] === 'function') {
                 return this[eClass][fn](object);
             } else {
                 return this[eClass][fn];
             }
        } else {
            return object.eClass.get('name');
        }
    },

    text: function(object) {
        return this._get('text', object);
    },

    icon: function(object) {
        return this._get('icon', object);
    },

    label: function(object) {
        return this._get('label', object);
    },

    EClass: {
        text: textNamedElement,
        label: textNamedElement,
        icon: 'icon-EClass'
    },
    EDataType: {
        text: textNamedElement,
        label: textNamedElement,
        icon: 'icon-EDataType'
    },
    EEnum: {
        text: textNamedElement,
        label: textNamedElement,
        icon: 'icon-EEnum'
    },
    EEnumLiteral: {
        text: function(object) {
            return object.get('name') + ' = ' + object.get('value');
        },
        label: textNamedElement,
        icon: 'icon-EEnumLiteral'
    },
    EAttribute: {
        text: textTypedElement,
        label: textNamedElement,
        icon: 'icon-EAttribute'
    },
    EReference: {
        text: textTypedElement,
        label: textNamedElement,
        icon: 'icon-EReference'
    },
    EOperation: {
        text: textTypedElement,
        label: textNamedElement,
        icon: 'icon-EOperation'
    },
    EPackage: {
        text: textNamedElement,
        label: textNamedElement,
        icon: 'icon-EPackage'
    },
    EAnnotation: {
        text: function(object) {
            return object.get('source');
        },
        label: function(object) {
            return object.get('source');
        },
        icon: 'icon-EAnnotation'
    },
    EStringToStringMapEntry: {
        text: function(object) {
            return object.get('key') + ' -> ' + object.get('value');
        },
        label: function(object) {
            return object.get('key');
        },
        icon: 'icon-EStringToStringMapEntry'
    },
    ResourceSet: {
        text: 'resourceSet',
        label: '',
        icon: 'icon-EObject'
    },
    Resource: {
        text: function(object) {
            return object.get('uri');
        },
        label: function(object) {
            return object.get('uri');
        },
        icon: 'icon-EObject'
    }

}



if (typeof require === 'function') {
    Ecore.sax = require('sax');
} else {
    Ecore.sax = root.sax;
}

Ecore.XMI = {

    dataType: 'xml',
    contentType: 'application/xml',

    parse: function(model, data) {
        if (!Ecore.sax) throw new Error('Sax is missing.');

        var parser = Ecore.sax.parser(true),
            resourceSet = model.get('resourceSet') || Ecore.ResourceSet.create(),
            namespaces = [],
            current;

        function findNamespaces(attributes) {
            if (!attributes) return;

            _.each(attributes, function(num, key) {
                if (key.indexOf(':') !== -1) {
                    var split = key.split(':');
                    if (split[0] === 'xmlns') {
                        namespaces.push({ prefix: split[1], uri: num });
                    }
                }
            });
        }

        function getNamespace(prefix) {
            var ns = _.find(namespaces, function(ns) {
                return ns.prefix === prefix;
            });

            return ns ? ns.uri : null;
        }

        function isPrefixed(node) {
            return isPrefixedString(node.name);
        }

        function isPrefixedString(string) {
            return string.indexOf(':') !== -1;
        }

        function getClassURIFromPrefix(value) {
             var split = value.split(':'),
                 prefix = split[0],
                 className = split[1],
                 uri = getNamespace(prefix) + '#//' + className;

             return uri;
        }

        function getClassURIFromFeatureType(node) {
            var eClass;

            if (node.parent && node.parent.eObject) {
                 var parent = currentNode.parent.eObject,
                     name = node.name,
                     eFeature = parent.eClass.getEStructuralFeature(name),
                     eType;

                 if (eFeature && eFeature.get) {
                      eType = eFeature.get('eType');
                      if (eType.get('abstract')) {
                          var aType = node.attributes['xsi:type'];
                          if (aType) {
                              eClass = resourceSet.getEObject(getClassURIFromPrefix(aType));
                          }
                      } else {
                          eClass = eType;
                      }
                 }
            }

            return eClass;
        }

        function findEClass(node) {
            if (isPrefixed(node)) {
                return resourceSet.getEObject(getClassURIFromPrefix(node.name));
            } else {
                return getClassURIFromFeatureType(node);
            }
        }

        var currentNode, rootObject, toResolve = [];

        parser.onopentag = function(node) {
            var eClass, eObject, eFeature, parentObject;

            findNamespaces(node.attributes);

            node.children = [];
            node.parent = currentNode;
            if (node.parent) node.parent.children.push(node);
            currentNode = node;

            eClass = findEClass(node);
            if (eClass) {
                eObject = currentNode.eObject = Ecore.create(eClass);
                if (!rootObject) rootObject = eObject;

                _.each(node.attributes, function(num, key) {
                    if (eObject.has(key)) {
                        eFeature = eObject.eClass.getEStructuralFeature(key);
                        if (eFeature.isTypeOf('EAttribute')) {
                            eObject.set(key, num);
                        } else {
                            toResolve.push({ parent: eObject, feature: eFeature, value: num });
                        }
                    }
                });

                if (node.parent) {
                    parentObject = node.parent.eObject;
                    if (parentObject.has(node.name)) {
                        eFeature = parentObject.eClass.getEStructuralFeature(node.name);
                        if (eFeature.get('containment')) {
                            if (eFeature.get('upperBound') === 1) {
                                parentObject.set(node.name, eObject);
                            } else {
                                parentObject.get(node.name).add(eObject);
                            }
                        } else {
                            // resolve proxy element from href
                            var attrs = node.attributes;
                            var href = attrs ? attrs.href : null;
                            if (href) {
                                toResolve.push({ parent: parentObject, feature: eFeature, value: href });
                            }
                        }
                    }
                }
            }
        };

        parser.onclosetag = function(tagName) {
            var parentObject;
            if (currentNode && currentNode.parent) {
                parentObject = currentNode.parent;
                delete currentNode.parent;
                currentNode = parentObject;
            }
        };

        function resolveReferences() {
            var index = model._index();

            function isLocal(uri) {
                return uri.substring(0, 1) === '/';
            }

            function setReference(parent, feature, value) {
                var refs = value.split(/\s/),
                    isMany = feature.get('upperBound') !== 1,
                    resolved;

                _.each(refs, function(ref) {
                    if (ref[0] === '#') ref = ref.substring(1, ref.length);

                    if (isLocal(ref)) {
                        resolved = index[ref];
                    } else {
                        resolved = resourceSet.getEObject(ref);
                    }
                    if (resolved) {
                        if (isMany) {
                            parent.get(feature.get('name')).add(resolved);
                        } else {
                            parent.set(feature.get('name'), resolved);
                        }
                    }
                });
            }

            _.each(toResolve, function(resolving) {
                var parent = resolving.parent,
                    feature = resolving.feature,
                    value = resolving.value;

                setReference(parent, feature, value);
            });
        }

        parser.write(data).close();
        model.add(rootObject);
        resolveReferences();
    },

    to: function(model, indent) {
        var docRoot = '',
            root = model.get('contents').first(),
            nsPrefix = root.eClass.eContainer.get('nsPrefix'),
            nsURI = root.eClass.eContainer.get('nsURI'),
            contentsFeature = Ecore.Resource.getEStructuralFeature('contents');

        function processElement(root) {
            docRoot += '<';

            var element;
            if (root.eContainingFeature && root.eContainingFeature !== contentsFeature) {
                element = root.eContainingFeature.get('name');
            } else {
                element = nsPrefix + ':' + root.eClass.get('name');
            }
            docRoot += element;

            if (root.eContainer.isKindOf('Resource')) {
                docRoot += ' xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI"';
                docRoot += ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';
                docRoot += ' xmlns:' + nsPrefix + '="' + nsURI + '"';
            }

            if (root.eContainingFeature.get('eType').get('abstract')) {
                docRoot += ' xsi:type="';
                docRoot += nsPrefix + ':' + root.eClass.get('name') + '"';
            }

            var features = root.eClass.get('eAllStructuralFeatures'),
                attributes = _.filter(features, function(feature) {
                    return !feature.get('derived') && feature.isTypeOf('EAttribute') &&
                        root.isSet(feature.get('name'));
                }),
                references = _.filter(features, function(feature) {
                    return !feature.get('derived') && feature.isTypeOf('EReference') &&
                        !feature.get('containment') && root.isSet(feature.get('name'));
                });

            _.each(attributes, function(feature) {
                var featureName = feature.get('name'),
                    value = root.get(featureName);

                if (value !== undefined && value !== 'false') {
                    docRoot += ' '  + featureName + '="' + value + '"';
                }
            });

            var externals = [];

            _.each(references, function(feature) {
                var value = root.get(feature.get('name'));
                var arrayValue = value instanceof Ecore.EList ? value.array() : value ? [value] : [];
                var externs = _.filter(arrayValue, function(v) { return v.eResource() !== root.eResource(); });
                if (externs.length) externals.push({ feature: feature, refs: externs });

                var internals = _.difference(arrayValue, externs);

                var refs = _.map(internals, function(v) { return v.fragment(); });
                if (refs.length) {
                    docRoot += ' '  + feature.get('name') + '="' + refs.join(' ') + '"';
                }
            });

            if (root.eContents().length === 0 && externals.length === 0) {
                docRoot += '/>';
            } else {
                docRoot += '>';

                _.each(externals, function(ext) {
                    var feature = ext.feature,
                        refs = ext.refs,
                        isAbstract = feature.get('eType').get('abstract'),
                        prefix;

                    _.each(refs, function(ref) {
                        docRoot += '<' + feature.get('name');
                        if (isAbstract) {
                            prefix = ref.eClass.eContainer.get('nsPrefix');
                            docRoot += ' xsi:type="' + (prefix ? prefix + ':' : '') + ref.eClass.get('name') + '"';
                        }
                        docRoot += ' href="' + ref.eURI() + '"' + ' />';
                    });
                });

                var containments = _.filter(features, function(feature) {
                    return  feature.isTypeOf('EReference') &&
                        feature.get('containment') &&
                        root.isSet(feature.get('name'));
                });

                _.each(containments, function(feature) {
                    var values = root.get(feature.get('name'));
                    if (feature.get('upperBound') !== 1) {
                        values.each(function(value) { processElement(value); });
                    } else {
                        processElement(values);
                    }
                });

                docRoot += '</' + element + '>';
            }

            return docRoot;
        }

        processElement(root);

        docRoot = indent ? formatXml(docRoot) : docRoot;
        docRoot = '<?xml version="1.0" encoding="UTF-8"?>\n' + docRoot;

        return docRoot;
    }
};

function formatXml(xml) {
    var reg = /(>)(<)(\/*)/g,
        wsexp = / *(.*) +\n/g,
        contexp = /(<.+>)(.+\n)/g;

    xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2');

    var pad = 0,
        formatted = '',
        lines = xml.split('\n'),
        indent = 0,
        lastType = 'other';

    // 4 types of tags - single, closing, opening, other (text, doctype, comment) - 4*4 = 16 transitions
    var transitions = {
        'single->single'    : 0,
        'single->closing'   : -1,
        'single->opening'   : 0,
        'single->other'     : 0,
        'closing->single'   : 0,
        'closing->closing'  : -1,
        'closing->opening'  : 0,
        'closing->other'    : 0,
        'opening->single'   : 1,
        'opening->closing'  : 0,
        'opening->opening'  : 1,
        'opening->other'    : 1,
        'other->single'     : 0,
        'other->closing'    : -1,
        'other->opening'    : 0,
        'other->other'      : 0
    };

    for (var i=0; i < lines.length; i++) {
        var ln = lines[i];
        var single = Boolean(ln.match(/<.+\/>/)); // is this line a single tag? ex. <br />
        var closing = Boolean(ln.match(/<\/.+>/)); // is this a closing tag? ex. </a>
        var opening = Boolean(ln.match(/<[^!].*>/)); // is this even a tag (that's not <!something>)
        var type = single ? 'single' : closing ? 'closing' : opening ? 'opening' : 'other';
        var fromTo = lastType + '->' + type;
        lastType = type;
        var padding = '';

        indent += transitions[fromTo];
        for (var j = 0; j < indent; j++) {
            padding += '    ';
        }

        formatted += padding + ln + '\n';
    }

    return formatted;
}


})();

