function hello() {

    //
    // The hello world model
    //

    // Each model must be contained in a EPackage
    // It must have a name, a nsPrefix and nsURI
    var helloPackage = Ecore.EPackage.create({ name: 'hello', nsPrefix: 'hello' , nsURI: 'http://ecore.js/hello'});

    // The EClass Hello has a single attribute 'world'
    // It must have a name
    var helloClass = Ecore.EClass.create({ name: 'Hello' });

    // Create the EAttribute
    // It must have a name and a type
    var worldAttribte = Ecore.EAttribute.create({ name: 'world', eType: Ecore.EString });

    // Add the attribute and the class to their container
    helloClass.get('eStructuralFeatures').add(worldAttribte);
    helloPackage.get('eClassifiers').add(helloClass);

    var rs = Ecore.ResourceSet.create();
    // A Resource is used to load/save a model and also
    // handles de/serialization operations on a model

    var hello = rs.create({ uri: 'hello' });

    // Add the EPackage to the Resource
    hello.get('contents').add(helloPackage);

    // Serialize the model in JSON
    console.log(hello.to(Ecore.JSON));

    //
    // Create instances
    //

    // We create three instances of the EClass Hello
    // Each instance is created by calling the method create.
    //
    // The method create is available on each EClass you created,
    // as well as on Ecore.
    // This method can be call in three different ways as shown below. Either
    // by calling it on the EClass with for parameter an object containing the
    // EAttribute you want to initialize or on Ecore itself with the EClass as first
    // parameter or part of the object parameter.

    var h1 = helloClass.create({ world: 'world 1' });
    var h2 = Ecore.create(helloClass, { world: 'world 2' });
    var h3 = Ecore.create({ eClass: helloClass, world: 'world 3' });

    // We can now display the value of the world attribute by calling the get method on
    // each instance.

    _.each([h1, h2, h3], function(h) { console.log(h.get('world')); });

    // To modify the value of an attribute, simply call the method set

    h3.set('world', 'world 4');

    console.log(h3.get('world'));

    // We can modify the EClass after its creation, for example by adding to it
    // a EReference.

    var closeToReference = Ecore.EReference.create({ name: 'closeTo', eType: helloClass, upperBound: -1 });
    helloClass.get('eStructuralFeatures').add(closeToReference);

    // Check that the instances can use the reference.

    console.log('can use closeTo?', h1.has('closeTo') != false);

    // Set a reference between h1 and h2, h3.

    h1.get('closeTo')
        .add(h2)
        .add(h3);

    console.log('h1 is closeTo', h1.get('closeTo').map(function(h) { return h.get('world'); }).join(', '));

    // Create a Resource for each instances.

    var r1 = rs.create({ uri: 'h1' });
    r1.get('contents').add(h1);
    var r2 = rs.create({ uri: 'h2' });
    r2.get('contents').add(h2);
    var r3 = rs.create({ uri: 'h3' });
    r3.get('contents').add(h3);

    // Serialize r1 to JSON

    var result = r1.to(Ecore.JSON);
    console.log(result);

    // The references to h2 and h3 are stored under the key $ref in JSON,
    // that could be resolved later during the parsing of that JSON data.

    console.log(result.closeTo[0].$ref, result.closeTo[1].$ref);

};

window.onload = hello;
