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

EClass creation:

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

