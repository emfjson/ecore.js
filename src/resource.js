
var EcoreFactory = Ecore.EcoreFactory;

Ecore.$ = root.jQuery || root.Zepto || root.ender || null;

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

/**
 * JSON serializer and parser
 *
 * See https://github.com/ghillairet/emfjson for details
 * about the JSON format used for EMF Models.
 *
**/

Ecore.JSON = {

    parse: function(model, data) {
        var toResolve = [];

        function processFeature(object, eObject) {
            if (!object || !eObject)
                return function( feature ) {};

            return function( feature ) {
                var featureName = feature.get('name'),
                    value = object[featureName];

                if (typeof value !== 'undefined') {
                    if ( feature.isTypeOf('EAttribute') ) {
                        eObject.set( featureName, value );
                    } else if (feature.get('isContainment')) {
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
                    features = eClass.eAllStructuralFeatures();

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
        var contents = model.contents,
            indexes = {};
            indexes[model.uri] = buildIndex(model);

        function uri(owner, value) {
            var valueModel = value.eResource(),
                ownerModel = owner.eResource(),
                external = valueModel !== ownerModel;

            if (!valueModel || !ownerModel) return;
            if (!indexes[valueModel.uri]) {
                indexes[valueModel.uri] = buildIndex(valueModel);
            }

            var index = indexes[valueModel.uri];
            for (var key in index) {
                if (index[key] === value) {
                    return external ? valueModel.uri + '#' + key : key;
                }
            }

            return null;
        }

        function processFeature( object, data ) {
            if (!object || !data) return function() {};

            return function( feature ) {
                var featureName = feature.get('name');

                if (!object.isSet(featureName)) return;

                var value = object.get(featureName),
                    isMany = feature.get('upperBound') !== 1;

                if (feature.isTypeOf('EAttribute')) {
                    data[featureName] = value;
                } else {
                    if (feature.get('isContainment')) {
                        if (isMany) {
                            data[featureName] = [];
                            value.each(function(val) {
                                data[featureName].push( jsonObject(val) );
                            });
                        } else {
                            data[featureName] = jsonObject(value);
                        }
                    } else {
                        if (isMany) {
                            data[featureName] = [];
                            value.each(function(val) {
                               data[featureName].push({
                                   '$ref': uri(object, val),
                                   'eClass': val.eClass.eURI()
                               });
                            });
                        } else {
                            data[featureName] = {
                                '$ref': uri(object, value),
                                'eClass': value.eClass.eURI()
                            };
                        }
                    }
                }
            };
        }

        function jsonObject(object) {
            var eClass = object.eClass,
                features = eClass.eAllStructuralFeatures(),
                data = {eClass: eClass.eURI()};

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

// Resource
//
var Resource = Ecore.Resource = function(uri) {
    this.uri = uri;
    this.contents = [];

    return this;
};

Resource.prototype = {

    clear: function() {
        this.contents.length = 0;
        return this;
    },

    add: function(eObject) {
        if (eObject) {
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
        if (!fragment) return null;

        return buildIndex(this)[fragment];
    },

    each: function(iterator, context) {
        return _.each(this.contents, iterator, context);
    },

    toJSON: function() {
        return Ecore.JSON.toJSON(this);
    },

    parse: function(data) {
        Ecore.JSON.parse(this, data);
        return this;
    },

    save: function(success, error) {
        var data = this.toJSON();
        if (data) {
            Ajax.post(this.uri, data, success, error);
        }
    },

    load: function(success, error, data) {
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
};

function initEcoreModel() {
    var model = new Resource('http://www.eclipse.org/emf/2002/Ecore');
    model.add(Ecore.EcorePackage);

    Ecore.Registry.register(model);

    return model;
}

var Registry = function() {
    var instance;

    Registry = function Registry() {
        return instance;
    };

    Registry.prototype = this;

    instance = new Registry();

    instance.constructor = Registry;
    instance.models = {};

    return instance;
};

Registry.prototype = {

    /**
     * Registers a model to the Registry by it's URI.
     *
    **/

    register: function(model) {
        this.models[model.uri] = model;

        return this;
    },

    /**
     * Returns the EObject corresponding to the given URI.
     *
    **/

    getEObject: function(uri) {
        var split = uri.split('#'),
            base = split[0],
            model = this.models[base],
            fragment,
            eObject;

        if (split.length === 2) {
            fragment = split[1];
        }

        if (model && fragment) {
            var index = buildIndex(model);
            eObject = index[fragment];
        }

        return eObject;
    }

};

Ecore.Registry = new Registry();
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
                        var _idx = value.fragment();
                        _buildIndex(value, _idx);
                    } else {
                        value.each(function(val) {
                            var position = value.indexOf( val );
                            var _idx = val.fragment();
                            _buildIndex(val, _idx);
                        });
                    }
                }
            });
        }

        var iD = root.eClass.get('eIDAttribute') || null;
        if (iD) {
            _buildIndex(root, root.get(iD.name));
        } else {
            _buildIndex(root, '/');
        }
    }

    return index;
}

})();
