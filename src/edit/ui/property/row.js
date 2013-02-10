
Edit.PropertyRow = Backbone.View.extend({
    propertyTemplate: _.template('<tr><td><%= name %></td></tr>'),
    valueTemplate: _.template('<td></td>'),

    initialize: function(attributes) {
        _.bindAll(this, 'renderEReference', 'renderEAttribute', 'renderEAttributeBoolean', 'render');

        if (_.isObject(this.model.eFeature)) {
            this.eFeature = this.model.eFeature;
            this.eFeatureName = this.eFeature.get('name');
            this.eType = this.eFeature.get('eType');
        } else {
            this.eFeatureName = this.model.eFeature;
        }

        this.value = this.model.value;

        if (this.model.options) {
            this.options = this.model.options;
        } else {
            if (this.eFeature.get('upperBound') !== 1) {
                this.options = this.model.eObject.get(this.eFeatureName).array();
            } else {
                this.options = getElements(this.model.eObject, this.eFeature);
            }
        }
    },

    renderEAttribute: function(model, eFeature, value) {
        var view;

        if (eFeature.get('many')) {

        } else {
            if (eFeature.get('eType') === Ecore.EBoolean)
                view = this.renderEAttributeBoolean(model, eFeature, value || false);
            else {
                view = new TextValue({ model: value });
                view.on('change', function(changed) {
                    model.set(eFeature.get('name'), changed);
                    model.trigger('change');
                    model.eResource().trigger('change', model);
                });
            }
        }

        return view;
    },

    renderEAttributeBoolean: function(model, eFeature, value) {
        var view = new SingleValueSelect({
            options: ['true', 'false'],
            value: value
        });

        view.on('change', function(changed) {
            model.set(eFeature.get('name'), changed);
            model.trigger('change');
            model.eResource().trigger('change', model);
        });

        return view;
    },

    renderEReference: function(model, eFeature, value) {
        var view;
        if (eFeature.get('upperBound') !== 1) {
            view = new MultiValueSelect({
                value: value,
                options: this.options
            });
        } else {
            view = new SingleValueSelect({
                value: value,
                options: this.options
            });
        }

        return view;
    },

    render: function() {
        var model = this.model.eObject,
            value = this.value || model.get(this.eFeatureName),
            html = this.propertyTemplate({ name: this.eFeatureName }),
            view;

        this.setElement(html);

        if (this.eFeature) {
            if (this.eFeature.isTypeOf('EAttribute')) {
                view = this.renderEAttribute(model, this.eFeature, value);
            } else {
                view = this.renderEReference(model, this.eFeature, value);
            }
        } else {
            view = new SingleValueSelect({
                model: [value],
                value: value,
                options: this.options
            });
            view.on('change', function(changed) {
                console.log(changed);
            });
        }

        if (view) {
            view.render();
            var td = $(document.createElement('td'));
            td.append(view.$el);
            this.$el.append(td);
        }

        return this;
    },

    remove: function() {
        this.$el.remove();

        return this;
    }

});


function getElements(eObject, eFeature) {
    var options = [];
    var value = eObject.get(eFeature);

    if (value) {
        var type = value.eClass;
        var resourceSet = eObject.eResource().get('resourceSet');
        var elements = resourceSet.elements();
        options = _.filter(elements, function(e) {
            return e.eClass === type; // || _.contains(e.eClass.get('eAllSuperTypes'), type);
        });
    }

    return options;
}

