function main() {

    //
    // Using ecorejs events
    //

    var rs = Ecore.ResourceSet.create();

    //
    // init model
    //

    var r = rs.create({ uri: 'res' });
    var p = Ecore.EPackage.create({
        name: 'model',
        nsPrefix: 'model',
        nsURI: 'http://ecore.js/model'
    });
    var Person = Ecore.EClass.create({
        name: 'Person'
    });
    var Person_name = Ecore.EAttribute.create({
        name: 'name',
        eType: Ecore.EString
    });
    Person.get('eStructuralFeatures').add(Person_name);
    p.get('eClassifiers').add(Person);
    r.get('contents').add(p);

    // listen to added features on Person

    Person.on('add:eStructuralFeatures', function(feature) {
        console.log(feature.get('name'), 'has been added');
    });

    var Person_knows = Ecore.EReference.create({
        name: 'knows',
        upperBound: -1,
        eType: Person
    });
    Person.get('eStructuralFeatures').add(Person_knows);

    // create instances

    var p1 = Person.create();

    // listen to set feature

    p1.on('change', function(f) {
        console.log('change feature:', f, 'new value is:', p1.get(f));
    });

    var p2 = Person.create({ name: 'John' });
    var p3 = Person.create({ name: 'Phil' });

    var r2 = rs.create({ uri: 'r2' });
    r2.get('contents').add(p1).add(p2).add(p3);

    // listen to changes at resource level

    r2.on('add change', function(o) {
        console.log('object changed', o);
    });

    p1.get('knows').add(p2);
    p2.set('name', 'Victor');
    p1.get('knows').add(p3);

    p1.set('name', 'Paul');

    // stop events

    r2.off();

    p2.get('knows').add(p1);
};

window.onload = main;
