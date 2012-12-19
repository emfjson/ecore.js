(function() {

    Ecore.Editor = {};

    var label = function() {
        var label = this.has('name') ? this.get('name') : this.get('uri');
        return this.eClass.get('name') + label ? ' ' + label : '';
    };

    var eClassLabel = function() {
        var supers = [];
        if (this.isSet('eSuperTypes')) {
            supers = this.get('eSuperTypes').map(function(s) { return s.get('name'); });
        }
        return this.get('name') + (supers.length ? ' > ' + supers.join(' , ') : '');
    };

    Ecore.EObject.get('eOperations').add(
        Ecore.EOperation.create({
            name: 'label',
            eType: Ecore.EString,
            upperBound: 1,
            lowerBound: 0,
            _: label
        }));

    Ecore.EClass.get('eOperations').add(
        Ecore.EOperation.create({
            name: 'label',
            eType: Ecore.EString,
            _: eClassLabel
        }));

    Ecore.EStructuralFeature.get('eOperations').add(
        Ecore.EOperation.create({
            name: 'label',
            eType: Ecore.EString,
            _: function() {
                return this.get('name') + ' : ' + this.get('eType').get('name');
            }
        }));

    _.each(Ecore.EPackage.Registry.ePackages(), function(p) {
        p.label = label;
        p.get('eClassifiers').each(function(c) {
            c.label = eClassLabel;

            if (c.has('eStructuralFeatures')) {
                c.get('eStructuralFeatures').each(function(f) {
                    f.label = function() {
                        return this.get('name') + ' : ' + this.get('eType').get('name');
                    };
                });
                c.get('eOperations').each(function(f) {
                    f.label = function() {
                        return this.get('name') + '()' + (this.isSet('eType') ? ' : ' + this.get('eType').get('name') : '');
                    };
                });
            }
        });
    });


