
Ecore.$ = root.jQuery || root.Zepto || root.ender || null;

// Ajax interface

var Ajax = {

    get: function(url, success, error) {
        if (!Ecore.$) return;

        return Ecore.$.ajax({
            url: url,
            dataType: 'json',
            success: success,
            error: error
        });
    },

    post: function(url, data, success, error) {
        if (!Ecore.$) return;

        return Ecore.$.ajax({
           type: 'POST',
           url: url,
           dataType: 'json',
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

    parse: function(model, data) {
        var toResolve = [];

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
                    resolved = Ecore.Registry.getEObject(ref);
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
                var eClass = Ecore.Registry.getEObject(object.eClass),
                    features = eClass.get('eAllStructuralFeatures');

                eObject = Ecore.create(eClass);

                _.each( features, processFeature(object, eObject) );
            }

            return eObject;
        }

        var parsed = parseObject(data);
        if (parsed) {
            model.add(parsed);
            resolveReferences();
        }
    },

    toJSON: function(model) {
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
        }
    ],
    eOperations: [
        {
            eClass: Ecore.EOperation,
            name: 'clear',
            _: function() {
                this.get('contents').clear();
            }
        },
        {
            eClass: Ecore.EOperation,
            name: 'add',
            _: function(eObject) {
                if (!_.isObject(eObject)) return this;
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
            name: 'add',
            _: function(eObject) {
                if (eObject) {
                    eObject.eContainer = this;
                    this.get('contents').add(eObject);
                }
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
            name: 'toJSON',
            _: function() {
                return Ecore.JSON.toJSON(this);
            }
        },
        {
            eClass: Ecore.EOperation,
            name: 'parse',
            _: function(data) {
                Ecore.JSON.parse(this, data);
                return this;
            }
        },
        {
            eClass: Ecore.EOperation,
            name: 'save',
            _: function(success, error) {
                var data = this.toJSON();
                if (data) {
                    Ajax.post(this.uri, data, success, error);
                }
            }
        },
        {
            eClass: Ecore.EOperation,
            name: 'load',
            _: function(success, error, data) {
                var model = this;
                var loadSuccess = function(data) {
                    model.parse(data);
                    return success(model);
                };

                if (data) {
                    return loadSuccess(data);
                } else {
                    return Ajax.get(this.uri, loadSuccess, error);
                }
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

var EClassResourceSet = Ecore.ResourceSet = Ecore.EClass.create({
    name: 'ResourceSet',
    eSuperTypes: [
        Ecore.EObject
    ],
    eStructuralFeatures: [
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
            name: 'create',
            _: function(uri) {
                var exists = this.get('resources').find(function(e) {
                    return e.get('uri') === uri;
                });
                if (exists) return exists;

                var resource = new Ecore.Resource(uri);
                this.get('resources').add(resource);

                return resource;
            }
        }
    ]
});

var EPackageResource = Ecore.EPackage.create({
    name: 'resources',
    nsPrefix: 'resources',
    nsURI: 'http://www.eclipselabs.org/ghillairet/ecore/resources',
    eClassifiers: [
        EClassResourceSet,
        EClassResource
    ]
});

function initEcoreModel() {
    var model = Ecore.Resource.create({ uri: 'http://www.eclipse.org/emf/2002/Ecore' });
    model.add(Ecore.EcorePackage);

    var resources = Ecore.Resource.create({ uri: 'http://www.eclipselabs.org/ghillairet/ecore/resources' });
    resources.add(EPackageResource);

    Ecore.Registry.register(model);
    Ecore.Registry.register(resources);

    return model;
}

// Registry of models

var Registry = function() {
    var instance;

    Registry = function Registry() {
        return instance;
    };

    Registry.prototype = this;

    instance = new Registry();

    instance.constructor = Registry;
    instance._index = {};
    instance._models = [];

    return instance;
};

Registry.prototype = {

    // Returns the Array of models
    //

    models: function() {
        return this._models;
    },

    // Registers a model to the Registry by it's URI.
    //

    register: function(model) {
        this._index[model.get('uri')] = model;
        this._models.push(model);

        return this;
    },

    unregister: function(model) {
        this._models = _.without(this._models, model);
        delete this._index[model.get('uri')];

        return this;
    },


    // Returns the EObject corresponding to the given URI.
    //

    getEObject: function(uri) {
        var split = uri.split('#'),
            base = split[0],
            model = this._index[base],
            fragment,
            eObject;

        if (split.length === 2) {
            fragment = split[1];
        }

        if (model && fragment) {
            eObject = buildIndex(model)[fragment];
        }

        return eObject;
    },

    // Returns all EObjects flatten in single array.
    //

    elements: function(type) {
        var contents = _.flatten(_.map(this.models(), function(m) {
            var values = _.values(m._index());
            if (type) {
                return _.filter(values, function(v) {
                    if (type.eClass) {
                        return v.eClass === type;
                    } else {
                        return v.eClass.get('name') === type;
                    }
                });
            }
        }));

        return contents;
    }

};

Ecore.Registry = new Registry();
initEcoreModel();

// Build index of EObjects contained in a Resource.
//
// The index keys are the EObject's fragment identifier, the
// values are the EObjects.
//

function buildIndex(model) {
    var index = {},
        contents = model.get('contents').array();

    if (contents.length === 1) {
        var root = contents[0];

        var build = function(object, idx) {
            var eContents = object.eContents();
            index[idx] = object;

            _.each(eContents, function(e) { build(e, e.fragment()); });
        };

        var iD = root.eClass.get('eIDAttribute') || null;
        if (iD) {
            build(root, root.get(iD.name));
        } else {
            build(root, '/');
        }
    }

    return index;
}

})();
