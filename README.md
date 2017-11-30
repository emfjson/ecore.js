[Ecore](http://www.eclipse.org/modeling/emf/?project=emf) ([EMOF](http://en.wikipedia.org/wiki/Meta-Object_Facility)) implementation in JavaScript.

## Content

* [Install](#installl)
* [Usage](#usage)
* [API](#api)
* [Contributing](#contributing)
* [History](https://github.com/ghillairet/ecore.js/releases/)
* [License](#license)


## Install

### Browser

Download Ecore.js from dist/ folder, and include it in your html along with underscore.js.

```html
<script src="underscore.js"></script>
<script src="ecore.js"></script>
```

Alternatively you can use the dependency manager [Bower](http://bower.io/) to install Ecore.js in your project.

```
bower install ecore
```

### Node

Ecore.js is available on npm and can be use as a Node module. To install it simply use the following command from your terminal:

```
npm install ecore
```

Importing Ecore.js in a Node module is done as follow:


```javascript
var Ecore = require('ecore');
```

## Usage

### Create a model

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
        // EReference are used to define links between domain
        // elements.
        Ecore.EReference.create({
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

### Create instances

```javascript
var u1 = User.create({ name: 'u1' });
var u2 = User.create({ name: 'u2' });
u1.get('friends').add(u2);

u1.get('friends').each(function(friend) { console.log(friend) });
```

### JSON Support

JSON is the default serialization format supported by ecore.js. The JSON format is
described [here](https://github.com/ghillairet/emfjson) and looks like this:

```javascript
{
    "eClass" : "/model.json#//User",
    "name" : "u1",
    "friends" : [
        { "$ref" : "/u2.json#/", "eClass": "/model.json#//User" },
        { "$ref" : "/u3.json#/", "eClass": "/model.json#//User" }
    ]
}
```

### XMI Support

Support for XMI has been added in version 0.3.0. This support requires [sax.js](https://github.com/isaacs/sax-js).

```javascript
var Ecore = require('ecore/dist/ecore.xmi');

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


## Contributing

If you want to contribute to this project or simply build from the source, you first need to clone the project by executing the following command in your terminal.


```
> git clone https://github.com/ghillairet/ecore.js.git
```

To build the project or run the tests you first need to install [Node](http://nodejs.org/), [npm](https://www.npmjs.org/) (distributed with Node) and [Grunt](http://gruntjs.com).

Once these are installed, go back to your terminal and enter the ecore.js directory.

```
> cd ecore.js
```

The tests are written using the [mocha](http://mochajs.org/) library. To run them, execute the following command:

```
> grunt test
```

Running a build will create a new distribution in the folder dist. This is done by executing the command:

```
> grunt build
```

That's it, you are now ready to contribute to the project.

## License
This software is distributed under the terms of the Eclipse Public License 1.0 - http://www.eclipse.org/legal/epl-v10.html.


