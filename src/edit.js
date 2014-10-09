
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

