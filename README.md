[Ecore](http://www.eclipse.org/modeling/emf/?project=emf) ([EMOF](http://en.wikipedia.org/wiki/Meta-Object_Facility)) implementation in JavaScript.

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

var resourceSet = Ecore.ResourceSet.create();
var resource = resourceSet.create({ uri: '/model.json' });

// EClass are used to define domain elements, they are identified
// by name and a set of structural features (attributes and references).

var User = Ecore.EClass.create({
    name: 'User',
    eStructuralFeatures: [
        // EAttributes are used to define domain elements
        // elements properties.
        Ecore.EAttribute.create({
            name: 'name',
            upperBound: 1,
            eType: Ecore.EString
        }),
        // EReferences are used to define links between domain
        // elements.
        Ecore.EReferences.create({
            name: 'friends',
            upperBound: -1,
            containment: false,
            eType: function() { return User; }
        })
    ]
});

// EPackages represent namespaces for a set of EClasses.
// It's properties name, nsURI and nsPrefix must be set.

var SamplePackage = Ecore.EPackage.create({
    name: 'sample',
    nsURI: 'http://www.example.org/sample',
    nsPrefix: 'sample',
    eClassifiers: [
        User
    ]
});

// Packages must be added directly to the model's Resource.

resource.add(SamplePackage);

```

Model Elements can also be created separately.

```javascript
var User = Ecore.EClass.create({ name: 'User' });
var User_name = Ecore.EAttribute.create({
   name: 'name',
   eType: Ecore.EString
});
var User_friends = Ecore.EReference.create({
   name: 'friends',
   upperBound: -1,
   eType: User
});
User.get('eStructuralFeatures').add(User_name);
User.get('eStructuralFeatures').add(User_friends);
```

EObject creation:

```javascript
var u1 = User.create({ name: 'u1' });
var u2 = User.create({ name: 'u2' });
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

## XMI

Support for XMI has been added in version 0.3.0. This support requires [sax.js](https://github.com/isaacs/sax-js).

```javascript
var resourceSet = Ecore.ResourceSet.create();
var resource = resourceSet.create({ uri: 'test2.xmi' });

resource.parse(data, Ecore.XMI); // data being a string containing the XMI.

resource.to(Ecore.XMI, true); // returns the XMI string

```

## API

### Ecore
 - create(eClass): EObject

### ResourceSet
 - create(): Resource
 - getEObject(uri): EObject

### Resource
 - add(value)
 - addAll(values)
 - clear()
 - each(iterator, [context])
 - save([sucess], [error])
 - load([sucess], [error], [data])
 - toJSON(): Object
 - getEObject(fragment): EObject

### EObject
 - has(property): Boolean
 - isSet(property): Boolean
 - set(property, value)
 - get(property): EObject or EList
 - isTypeOf(type): Boolean
 - isKindOf(type): Boolean
 - eResource(): Resource
 - eURI(): String
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

### 0.3.0
 - add events
 - add XMI support
 - add support for derived features
 - add support for eOperations
 - add ResourceSet

### 0.2.0
 - add Resource support
 - add JSON parsing serialization
 - add new syntax to define EModelElements
 - move create methods to Ecore

### 0.1.1
 - initial version
 - bootstraps ecore model

## License
This software is distributed under the terms of the Eclipse Public License 1.0 - http://www.eclipse.org/legal/epl-v10.html.


