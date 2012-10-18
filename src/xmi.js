(function() {

    var sax = this.sax || require('sax');

    Ecore.XMI = {

        parse: function(model, data) {
            var parser = sax.parser(true),
                namespaces = [],
                current;

            function findNamespaces(attributes) {
                if (!attributes) return;

                _.each(attributes, function(num, key) {
                    if (key.indexOf(':') !== -1) {
                        var split = key.split(':');
                        if (split[0] === 'xmlns') {
                            namespaces.push({prefix: split[1], uri: num});
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

            function findEClass(name) {
                if (name.indexOf(':') !== -1) {
                    var split = name.split(':'),
                        prefix = split[0],
                        className = split[1],
                        uri = getNamespace(prefix) + '#//' + className;

                    return Ecore.Registry.getEObject(uri);
                } else {
                    if (currentNode.parent.eObject) {
                        var parent = currentNode.parent.eObject,
                            eFeature = parent.eClass.getEStructuralFeature(name),
                            eClass = eFeature.get('eType');

                        return eClass;
                    }
                }
            }

            var currentNode, rootObject, toResolve = [];

            parser.onopentag = function(node) {
                findNamespaces(node.attributes);

                node.children = [];
                node.parent = currentNode;
                if (node.parent) node.parent.children.push(node);
                currentNode = node;

                var eClass = findEClass(node.name);
                if (eClass) {
                    var eObject = currentNode.eObject = Ecore.create(eClass);
                    if (!rootObject) rootObject = eObject;

                    _.each(node.attributes, function(num, key) {
                        if (eObject.has(key)) {
                            var eFeature = eObject.eClass.getEStructuralFeature(key);
                            if (eFeature.isTypeOf('EAttribute')) {
                                eObject.set(key, num);
                            } else {
                                toResolve.push({ parent: eObject, feature: eFeature, value: num });
                            }
                        }
                    });

                    if (node.parent) {
                        var p = node.parent.eObject;
                        if (p.has(node.name)) {
                            var eFeature = p.eClass.getEStructuralFeature(node.name);
                            if (eFeature.get('upperBound') === 1) {
                                p.set(node.name, eObject);
                            } else {
                                p.get(node.name).add(eObject);
                            }
                        }
                    }
                }
            };

            parser.onclosetag = function(tagName) {
                if (currentNode && currentNode.parent) {
                    var p = currentNode.parent;
                    delete currentNode.parent;
                    currentNode = p;
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

        toXMI: function(model, format) {
            var docRoot = '',
                root = model.contents[0],
                nsPrefix = root.eClass.eContainer.get('nsPrefix'),
                nsURI = root.eClass.eContainer.get('nsURI');

            function processElement(root){
                docRoot += '<';

                var element;
                if (root.eContainingFeature) {
                    element = root.eContainingFeature.get('name');
                } else {
                    element = nsPrefix + ':' + root.eClass.get('name');
                }
                docRoot += element;

                if (root.eContainer instanceof Ecore.Resource) {
                    docRoot += ' xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';
                    docRoot += ' xmlns:' + nsPrefix + '="' + nsURI + '"';
                }

                var features = root.eClass.eAllStructuralFeatures(),
                    attributes = _.filter(features, function(feature) {
                        return feature.isTypeOf('EAttribute') && root.isSet(feature.get('name'));
                    }),
                    references = _.filter(features, function(feature) {
                        return feature.isTypeOf('EReference') &&
                            !feature.get('isContainment') &&
                            root.isSet(feature.get('name'));
                    });

                _.each(attributes, function(feature) {
                    docRoot += ' '  + feature.get('name') + '="' + root.get(feature.get('name')) + '"';
                });

                _.each(references, function(feature) {
                    var value = root.get(feature.get('name'));
                    var refs = _.map(value instanceof Ecore.EList ? value._internal : [value], function(v) {
                        return v.fragment();
                    });
                    docRoot += ' '  + feature.get('name') + '="' + refs.join(' ') + '"';
                });

                if (root.eContents().length === 0) {
                    docRoot += '/>';
                } else {
                    docRoot += '>';

                     var containments = _.filter(features, function(feature) {
                        return feature.isTypeOf('EReference') &&
                            feature.get('isContainment') &&
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

            docRoot = format ? formatXml(docRoot) : docRoot;
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
