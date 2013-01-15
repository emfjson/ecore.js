
//
// Ecore.Edit
//

var Edit = Ecore.Edit = {
    version: '0.3.0'
};

//
// LabelProvider
//
// Provides labels for EObjects.
//
// It can be extended to provide labels to different kind of EObject by
// using the extend method provided by underscore:
//
//      _.extend(Ecore.Edit.LabelProvider, {
//          FooClass: function(eObject) { return eObject.get('bar'); }
//      });
//

Edit.LabelProvider = {
    getLabel: function(eObject) {
        var eClass = eObject.eClass.get('name');
        if (this[eClass])
            return this[eClass](eObject);
        else
            return eObject.eClass.get('name');
    },

    // Labels for Ecore classes

    EClass: function(eObject) { return eObject.get('name'); },
    EDataType: function(eObject) { return eObject.get('name'); },
    EEnum: function(eObject) { return eObject.get('name'); },
    EEnumLiteral: function(eObject) { return eObject.get('name') + ' = ' + eObject.get('value'); },
    EAttribute: function(eObject) {
        var type = eObject.isSet('eType') ? ' : ' + eObject.get('eType').get('name') : '';
        return eObject.get('name') + type;
    },
    EReference: function(eObject) {
        var type = eObject.isSet('eType') ? ' : ' + eObject.get('eType').get('name') : '';
        return eObject.get('name') + type;
    },
    EOperation: function(eObject) {
        var returnType = eObject.isSet('eType') ? ' : ' + eObject.get('eType').get('name') : '';
        return eObject.get('name') + '()' + returnType;
    },
    EPackage: function(eObject) { return eObject.get('name'); },
    ResourceSet: function(eObject) { return 'resourceSet'; },
    Resource: function(eObject) { return eObject.get('uri'); }
};

