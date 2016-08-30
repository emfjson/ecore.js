
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
                 className = split[1];

             return getNamespace(prefix) + '#//' + className;
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
                      var aType = node.attributes['xsi:type'];
                      if (aType) {
                          eClass = resourceSet.getEObject(getClassURIFromPrefix(aType));
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
        
        parser.ontext = function(text) {
        	if(currentNode && currentNode.waitingForAttributeText) {
        		// The attribute was provided as an XMI element, 
        		// so store it to the parent node as an attribute.
        		currentNode.parent.eObject.set(currentNode.name, text);
        	}
        };

        parser.onopentag = function(node) {
            var eClass, eObject, eFeature, parentObject;

            findNamespaces(node.attributes);

            node.children = [];
            node.parent = currentNode;
            if (node.parent) node.parent.children.push(node);
            currentNode = node;

            eClass = findEClass(node);
            if (eClass) {
            	var nodeIsAnAttribute = currentNode.parent && currentNode.parent.eObject && currentNode.parent.eObject.eClass.getEStructuralFeature(node.name).isTypeOf('EAttribute');
            	if (nodeIsAnAttribute) {
            		// Set flag for parser.ontext to process and store attribute text
            		node.waitingForAttributeText = true;
            	} else {
            		eObject = currentNode.eObject = Ecore.create(eClass);

                    if (!rootObject) {
                        rootObject = eObject;
                    }
                    
                    _.each(node.attributes, function(num, key) {
                    	if (eObject.has(key)) {
                    		eFeature = eObject.eClass.getEStructuralFeature(key);
                    		if (eFeature.isTypeOf('EAttribute')) {
                    			eObject.set(key, num);
                    		} else {
                    			toResolve.push({ parent: eObject, feature: eFeature, value: num });
                    		}
                    	}
                    	// Special processing for xmi:id's
                    	if (key === 'xmi:id') {
                            eObject._id = num;
                    	}
                    });
                    
                    if (node.parent) {
                        parentObject = node.parent.eObject;
                        if (parentObject && parentObject.has(node.name)) {
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
                        } else {
                        	// There are multiple rootObjects.
                        	if(rootObject && (rootObject !== eObject)) {
                        		// There is already a rootObject that has been processed.
                        		model.add(rootObject);
                        		rootObject = eObject;
                        	}
                        }
                    }
            	}
            } else if (eClass === undefined) {
            	throw new Error( node.name + " has undefined/invalid eClass.");
            } //again, eClass may be null
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
                
                if (refs[0] === 'ecore:EDataType') {
                	// Throw out first part as it will resolve to a null reference.
                    // The second element contains the actual eType
                	refs.shift();
                }

                _.each(refs, function(ref) {
                    if (ref[0] === '#') ref = ref.substring(1, ref.length);

                    if (isLocal(ref)) {
                        resolved = index[ref];
                    } else {
                        resolved = resourceSet.getEObject(ref);
                        if (resolved === null) {
                        	console.log('Warning: ' + ref + ' is an unresolved reference');
                        }
                    }
                    if (resolved) {
                        if (isMany) {
                            parent.get(feature.get('name')).add(resolved);
                        } else {
                            parent.set(feature.get('name'), resolved);
                        }
                    } else if (resolved === undefined) {
                    	//Note: resolved is null in certain valid situations
                    	throw new Error("Undefined reference: " + ref);
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
        	contents = model.get('contents').array(),
            nsPrefix,
            nsURI,
            contentsFeature = Ecore.Resource.getEStructuralFeature('contents');
        
        function escapeXML(text) {
        	  var map = {
        	    '&': '&amp;',
        	    '<': '&lt;',
        	    '>': '&gt;',
        	    '"': '&quot;',
        	    "'": '&#039;'
        	  };
        	  
        	  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
        	}

        function processElement(root, isSingleInstance) {
            docRoot += '<';

            var element;
            if (root.eContainingFeature && root.eContainingFeature !== contentsFeature) {
                element = root.eContainingFeature.get('name');
            } else {
                element = nsPrefix + ':' + root.eClass.get('name');
            }
            
            docRoot += element;
            
            if (root.eContainer.isKindOf('Resource')) {
                // This is an instance at the top level of the resource
            	if (isSingleInstance) {
            	    // This is the only instance in the resource
            		docRoot += ' xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI"';
                    docRoot += ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';
                    docRoot += ' xmlns:' + nsPrefix + '="' + nsURI + '"';
            	}
            } else {
                // This is a nested element, need to check if subtype is needed
                if (root.eContainingFeature.get('eType') !== root.eClass) {
                  	docRoot += ' xsi:type="';
                  	docRoot += nsPrefix + ':' + root.eClass.get('name') + '"';                  
                }
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
            
            // Write the xmi:id if necessary
            if (root._id) {
                docRoot += ' xmi:id="' + root._id + '"';
            }

            _.each(attributes, function(feature) {
                var featureName = feature.get('name'),
                    value = root.get(featureName);

                if (value !== undefined && value !== 'false') {
                	docRoot += ' '  + featureName + '="';
                	if (typeof(value) === 'string') {
                		docRoot += escapeXML(value);
                	}
                	else {
                		docRoot += value;
                	}
                    docRoot += '"';
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

        // Process the instance(s) in the resource
        if(contents.length === 1) {
            // There is only one instance in this resource
        	nsPrefix = contents[0].eClass.eContainer.get('nsPrefix');
            nsURI = contents[0].eClass.eContainer.get('nsURI');
        	processElement(contents[0], true);
        	
        } else {
            // There are multiple instances in this resource
        	var namespaces = {}; // Used to store unique namespaces
        	
            for (var i in contents) {
        		nsPrefix = contents[i].eClass.eContainer.get('nsPrefix');
                nsURI = contents[i].eClass.eContainer.get('nsURI');
                namespaces[nsPrefix] = nsURI;       
            	processElement(contents[i]);
            }
            
            // Construct the namespace portion of the XMI element 
        	var nsString = '';
        	for (var nsKey in namespaces) {
        		nsString += ' xmlns:' + nsKey + '="' + namespaces[nsKey] + '"';
        	}
        	
        	// Wrap the processed elements with the XMI element
        	docRoot = '<xmi:XMI xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' + nsString + '>' + docRoot + '</xmi:XMI>';
        	
        }
        
        // Format the final result
        docRoot = indent ? formatXml(docRoot) : docRoot;
        docRoot = '<?xml version="1.0" encoding="UTF-8"?>\n' + docRoot;
        
        return docRoot;
    }
};

function formatXml(xml) {
    var reg = /(>)(<)(\/*)/g,
        wsexp = / *([^ ].*[^ ]) *\n/g,
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

