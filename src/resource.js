
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
        if (_.isString(data)) {
            data = JSON.parse(data);
        }

        var toResolve = [],
            resourceSet = model.get('resourceSet') || Ecore.ResourceSet.create();

        function processFeature(object, eObject) {
            if (!object || !eObject)
                return function() {};

            return function( feature ) {
                if (!feature || feature.get('derived')) return;

                var featureName = feature.get('name'),
                    value = object[featureName];

                if (typeof value !== 'undefined') {
                    if ( feature.isTypeOf('EAttribute') ) {
                        eObject.set( featureName, value );
                    } else if (feature.get('containment')) {
                        var eType = feature.get('eType');
                        if (feature.get('upperBound') === 1) {
                            eObject.set( featureName, parseObject(value, eType) );
                        } else {
                            _.each(value || [], function(val) {
                                eObject.get( featureName ).add( parseObject(val, eType) );
                            });
                        }
                    } else {
                        toResolve.push({ parent: eObject, feature: feature, value: value });
                    }
                }
            };
        }

        function processAnnotation(node, eObject) {
            if (node.source) {
                eObject.set('source', node.source);
            }

            if (node.details) {
                if (_.isArray(node.details)) {

                } else {
                    var details = eObject.get('details');
                    _.each(node.details, function(v, k) {
                        details.add(Ecore.EStringToStringMapEntry.create({ 'key': k, 'value': v }));
                    });
                }
            }
        }

        function resolveReferences() {
            var index = buildIndex(model);

            function setReference(parent, feature, value, isMany) {
                var ref = value.$ref;
                var resolved = index[ref];

                if (!resolved) {
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
                    _.each(_.isArray(value) ? value : [value], function(val) {
                        setReference(parent, feature, val, true);
                    });
                }
            });
        }

        function parseObject(object, eClass) {
            var child;

            if (object && (eClass || object.eClass)) {
                if (object.eClass) {
	                eClass = resourceSet.getEObject(object.eClass);
                }

                try {
                    child = Ecore.create(eClass);
                } catch (e) {
                    throw new Error('Cannot parse or cannot find EClass for object' + JSON.stringify(object));
                }

                if (child) {
                    if (object._id) {
                        child._id = object._id;
                    }

                    if (eClass === Ecore.EAnnotation) {
                        processAnnotation(object, child);
                    } else {
                        _.each(eClass.get('eAllStructuralFeatures'), processFeature(object, child));
                    }
                }
            }

            return child;
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

        function processAnnotation(object, data) {
            if (object.values.source) {
                data.source = object.values.source;
            }

            if (object.values.details && object.values.details.size() > 0) {
                data.details = {};
                object.values.details.each(function (e) {
                    var key = e.get("key");
                    var value = e.get("value");
                    if (key) {
                        data.details[key] = value;
                    }
                });
            }
        }

        function jsonObject(object) {
            var eClass = object.eClass,
                values = object.values,
                data = { eClass: eClass.eURI() };

            if (object._id) { data._id = object._id; }

            if (eClass === Ecore.EAnnotation) {
                processAnnotation(object, data);
            } else {
                _.each(values, processFeature(object, data));
            }

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
                
                if(this._index()[fragment]) {
                    return this._index()[fragment];
                }
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
            _: function(callback, options) {
                options || (options = {});

                var formatter = options.format ? options.format : Ecore.JSON;
                var data;
                try {
                    data = this.to(formatter);
                } catch (e) {
                    callback(null, e);
                }

                callback(data, null);
            }
        },
        {
            eClass: Ecore.EOperation,
            name: 'load',
            _: function(data, callback, options) {
                options || (options = {});

                var loader = options.format || Ecore.JSON;
                var resourceSet = this.get('resourceSet');

                try {
                    this.parse(data, loader);
                } catch (e) {
                    callback(null, e);
                }

                this.trigger('change');
                if (typeof callback === 'function') {
                    callback(this, null);
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
                if (_.isUndefined(this.__updateIndex)) {
                    var res = this;
                    res.__updateIndex = true;
                    res.on('add remove', function() {
                        res.__updateIndex = true;
                    })
                }

                if (this.__updateIndex) {
                    this.__index = buildIndex(this);
                    this.__updateIndex = false;
                }

                return this.__index;
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
                var attrs = _.isObject(uri) ? uri : { uri: uri };

                if (!attrs.uri) {
                    throw new Error('Cannot create Resource, missing URI parameter');
                }

                var resource = this.get('resources').find(function(e) {
                    return e.get('uri') === attrs.uri;
                });

                if (resource) return resource;

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
                
                if (!fragment) {
                	return null;
                }

                var ePackage = Ecore.EPackage.Registry.getEPackage(base);

                if (ePackage) {

                    resource = ePackage.eResource();

                    if (!resource) {
                        resource = this.create({ uri: base });
                        resource.add(ePackage);
                        this.get('resources').add(resource);
                        resource.set('resourceSet', this);
                    }
                }

                if (resource) {
                    return resource.getEObject(fragment);
                }

                resource = this.get('resources').find(function(e) {
                    return e.get('uri') === base;
                });

                return resource ? resource.getEObject(fragment) : null;
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
            if (root._id) {
                build(root, root._id);
            } else {
                iD = root.eClass.get('eIDAttribute') || null;
                if (iD) {
                    build(root, root.get(iD.get('name')));
                } else {
                    build(root, '/');
                }
            }
        } else {
            for (var i = 0; i < contents.length; i++) {
                root = contents[i];
                if (root._id) {
                    build(root, root._id);
                } else {
                    iD = root.eClass.get('eIDAttribute') || null;
                    if (iD) {
                        build(root, root.get(iD.get('name')));
                    } else {
                        build(root, '/' + i);
                    }
                }
            }
        }
    }

    return index;
}

