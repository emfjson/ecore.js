var data = {
    model: {
        "eClass" : "http://www.eclipse.org/emf/2002/Ecore#//EPackage",
        "name" : "example",
        "nsURI" : "http://www.example.org/example",
        "nsPrefix" : "example",
        "eClassifiers" : [ {
            "eClass" : "http://www.eclipse.org/emf/2002/Ecore#//EClass",
            "name" : "A",
            "eStructuralFeatures" : [ {
                "eClass" : "http://www.eclipse.org/emf/2002/Ecore#//EAttribute",
                "name" : "name",
                "eType" : {
                    "$ref" : "http://www.eclipse.org/emf/2002/Ecore#//EString",
                    "eClass" : "http://www.eclipse.org/emf/2002/Ecore#//EDataType"
                }
            } ]
        }, {
            "eClass" : "http://www.eclipse.org/emf/2002/Ecore#//EClass",
            "name" : "B",
            "eSuperTypes": [
            {"$ref": "//A"}
            ]
        }
        ]
    }
};

var main = function() {
    console.log('start benchmark');

    var model = Ecore.Resource.create({ uri: 'simple' });
    var onSuccess = function(result) {};
    var onError = function() {};
    var input = { data: data.model };

    Bench.bench(model.load, 1, [onSuccess, onError, input], model);
};

window.onload = main;
