(function() {

    Ecore.Editor = {};

    var label = function() {
        var label = this.has('name') ? this.get('name') : this.get('uri');
        return this.eClass.get('name') + label ? ' ' + label : '';
    };

    Ecore.EObject.get('eOperations').add(
        Ecore.EOperation.create({
            name: 'label',
            eType: Ecore.EString,
            upperBound: 1,
            lowerBound: 0,
            _: label
        }
    ));

    _.each(Ecore.Registry.models(), function(m) {
        m.label = label;
        m.get('contents').each(function(p) {
            p.label = label;
            p.get('eClassifiers').each(function(c) {
                c.label = label;
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
    });

