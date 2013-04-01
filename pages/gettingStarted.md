<section>

# Getting Started

Browser: Download ecore.js from dist/ folder, and include it in your html along with underscore.js.

```
<script src="underscore.js"></script>
<script src="ecore.js"></script>
```

Node:

```
npm install ecore

var Ecore = require('ecore');
```

## Models

Resources contain model elements and are identified by a URI.

```javascript
var resourceSet = Ecore.ResourceSet.create();
var resource = resourceSet.create({ uri: '/model.json' });
```

```javascript
var User = Ecore.EClass.create({ name: 'User' });
```

EAttributes are used to define domain elements elements properties.

```javascript
var UserName = Ecore.EAttribute.create({
    name: 'name',
    upperBound: 1,
    eType: Ecore.EString
});
```

EReferences are used to define links between domain elements.

```javascript
var UserFriends = Ecore.EReferences.create({
    name: 'friends',
    upperBound: -1,
    containment: false,
    eType: User
});
```

You can now add the features to the User class.

```javascript
User.get('eStructuralFeatures')
    .add(UserName)
    .add(UserFriends);
```

EPackages represent namespaces for a set of EClasses.
It's properties name, nsURI and nsPrefix must be set.

```javascript
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

You can now create instances of User by calling the same method create on User.

```javascript
var u1 = User.create({ name: 'u1' });
var u2 = User.create();
```

You can access the istance properties via the methods get and set like this.

```javascript
u2.set('name', 'u2');
u1.get('friends').add(u2);
```

```javascript
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

</section>
