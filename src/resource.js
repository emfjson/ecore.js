(function() {

    var root = this,
        Ecore = root.Ecore,
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
                                eObject.get( featureName ).push( parseObject(val) );
                            });
                        }
                    }
                }
            };

            function parseObject(object) {

                if (object && object.eClass) {
                    var eClass = Ecore.Registry.getEObject(object.eClass),
                        features = eClass.get('eStructuralFeatures'),
                        eObject = Ecore.create(eClass);

                    _.each( features, processFeature(object, eObject) );

                    return eObject;
                }

                return null;
            };

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
            };

            function jsonObject(object) {
                var eClass = object.eClass,
                    features = eClass.get('eStructuralFeatures'),
                    data = {};

                _.each( features, processFeature(object, data) );

                return data;
            };

            var data;
            if (contents.length === 1) {
                var eObject = contents[0];
                data = jsonObject(eObject);
            }
            return data;
        }

    };

    // Model or Resource ?
    var Model = Ecore.Model = function(attributes) {
        attributes || (attributes = {});
        this.uri = attributes.uri;
        this.contents = [];

        return this;
    };

    Model.prototype.clear = function() {
        this.contents.length = 0;
        return this;
    };

    Model.prototype.add = function(eObject) {
        eObject.eModel = this;
        eObject.eContainer = this;
        this.contents.push(eObject);

        return this;
    };

    Model.prototype.addAll = function(content) {
        if (_.isArray(content)) {
            _.each(content, function(eObject) { this.add(eObject); }, this);
        }

        return this;
    };

    Model.prototype.each = function(iterator, context) {
        return _.each(this.contents, iterator, context);
    };

    Model.prototype.save = function(success, error) {
        var data = Ecore.JSON.toJSON(this);
    };

    Model.prototype.load = function(success, error) {
        var model = this;
        var loadSuccess = function(data) {
            model.addAll( Ecore.JSON.parse(data) );
            return success(model);
        };

        return Ajax.get(this.uri, loadSuccess, error);
    };

    function initEcoreModel() {
        var model = new Model('http://www.eclipse.org/emf/2002/Ecore');
        var ecore = initEcore();
        model.add(ecore);

        Ecore.Registry.register(model);

        return model;
    };

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

    ModelRegistry.prototype.register = function(model) {
        this.models[model.uri] = model;
        return this;
    };

    ModelRegistry.prototype.getEObject = function(uri) {
        var split = uri.split('#');
        var base = uri.split[0];
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
    };

    Ecore.Registry = new Ecore.ModelRegistry();

    function buildIndex(model) {
        var base = model.uri;
        var index = {};

        var contents = model.contents;

        if (contents.length === 1) {
            var root = contents[0];

            function _buildIndex(object, idx) {
                var values = _.values(index);
                if (_.find(values, function(o) { return o === object; })) {
                    return;
                }

                var eClass = object.eClass;
                var eFeatures = eClass.get('eStructuralFeatures');
                index[idx] = object;

                eFeatures.each(function(feature) {

                    if (feature.isTypeOf('EReference')) {
                        var value = object.get(feature.get('name'));

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
            };

            var iD = root.eClass.get('eIDAttribute') || null;
            if (iD) {
                _buildIndex(root, '//' + root.get(iD.name));
            } else {
                _buildIndex(root, '/');
            }
        }

        return index;
    };

})();