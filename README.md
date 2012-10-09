Ecore (EMOF) implementation in JavaScript.

## Install

Browser:
Download ecore.js from dist/ folder, and include it in your html along with underscore.js.

```
<script src="underscore.js"></script>
<script src="ecore.js"></script>
```

Node:

```
npm install ecore

var Ecore = require('ecore');
```

## Usage

Defining a Model:

```javascript

// Resources contain model elements and are identified by a URI.

var model = new Ecore.Resource('/model.json');

// EClass are used to define domain elements, they are identified
// by name and a set of structural features (attributes and references).

var User = Ecore.createEClass({
    name: 'User',
    eStructuralFeatures: [
        // EAttributes are used to define domain elements
        // elements properties.
        Ecore.createEAttribute({
            name: 'name',
            upperBound: 1,
            eType: Ecore.EcorePackage.EString
        }),
        // EReferences are used to define links between domain
        // elements.
        Ecore.createEReference({
            name: 'friends',
            upperBound: -1,
            isContainment: false,
            // If reference non previously defined variables,
            // use a function that will return it a posteriori.
            eType: function() { return User; }
        })
    ]
});

// EPackages represent namespaces for a set of EClasses.
// It's properties name, nsURI and nsPrefix must be set.

var SamplePackage = Ecore.createEPackage({
    name: 'sample',
    nsURI: 'http://www.example.org/sample',
    nsPrefix: 'sample',
    eClassifiers: [
        User
    ]
});

// Packages must be added directly to the model's Resource.

model.add(SamplePackage);

// Once created the model can be regitered.

Ecore.Registry.register(model);

```

Model Elements can also be created separately.

```javascript
var User = Ecore.EcoreFactory.createEClass({name: 'User'});
var User_name = Ecore.EcoreFactory.createEAttribute({
   name: 'name',
   eType: Ecore.EcorePackage.EString
});
var User_friends = Ecore.EcoreFactory.createEReference({
   name: 'friends',
   upperBound: -1,
   eType: User
});
User.get('eStructuralFeatures').add(User_name);
User.get('eStructuralFeatures').add(User_friends);
```

EObject creation:

```javascript
var u1 = Ecore.create(User);
u1.set('name', 'u1');
var u2 = Ecore.create(User);
u2.set('name', 'u2');
u1.get('friends').add(u2);

u1.get('friends').each(function(friend) { console.log(friend) });
```

## JSON

JSON is the default serialization format supported by ecore.js. The JSON format is
described [here](https://github.com/ghillairet/emfjson) and looks like this:

```javascript
{
    "eClass" : "/model.json#//User",
    "name" : "u1",
    "friends" : [
        { "$ref" : '/u2.json#/', eClass: '/model.json#//User' },
        { "$ref" : '/u3.json#/', eClass: '/model.json#//User' }
    ]
}
```

## API

### Ecore
 - create(eClass)
 - createEClass(attributes)
 - createEDataType(attributes)
 - createEAttribute(attributes)
 - createEReference(attributes)

### Resource
 - add(value)
 - addAll(values)
 - clear()
 - each(iterator, [context])
 - save([sucess], [error])
 - load([sucess], [error], [data])
 - toJSON()
 - getEObject(fragment)

### EObject
 - has(property)
 - isSet(property)
 - set(property, value)
 - get(property)
 - isTypeOf(type)
 - isKindOf(type)
 - eResource()
 - eURI()
 - eAllStructuralFeatures()
 - eAllSuperTypes()
 - getEStructuralFeature(name)

### EList
 - add(element)
 - addAll(elements)
 - remove(element)
 - size()
 - at(position)
 - first()
 - last()
 - rest(index)
 - each(iterator, [context])
 - filter(iterator, [context])
 - find(iterator, [context])
 - map(iterator, [context])
 - reject(iterator, [context])
 - contains(iterator, [context])
 - indexOf(iterator, [context])


## History

### 0.2.0
 - add Resource support
 - add JSON parsing serialization
 - add new syntax to define EModelElements
 - move create methods to Ecore

### 0.1.1
 - initial version
 - bootstraps ecore model

### License
This software is distributed under the terms of the Eclipse Public License 1.0 - http://www.eclipse.org/legal/epl-v10.html.


