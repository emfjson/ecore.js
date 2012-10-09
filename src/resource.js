
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
                        if (value)
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

    save: function(success, error) {
        var data = this.toJSON();
        if (data) {
            Ajax.post(this.uri, data, success, error);
        }
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
            _buildIndex(root, root.get(iD.name));
        } else {
            _buildIndex(root, '/');
        }
    }

    return index;
}

})();
