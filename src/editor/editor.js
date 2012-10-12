jQuery(function(){

    _.extend(Ecore.EObject.prototype, Backbone.Events);

    $('[contenteditable]').live('focus', function() {
        var $this = $(this);
        $this.data('before', $this.html());
        return $this;
    }).live('blur keyup paste', function() {
        var $this = $(this);
        if ($this.data('before') !== $this.html()) {
            $this.data('before', $this.html());
            $this.trigger('change');
        }
        return $this;
    });

    var Editor = window.Editor = {};

    // Views

    Editor.MetaBrowserView = Backbone.View.extend({
        el: '#class-columns',
        render: function() {
            var packages = _.flatten(_.map(_.values(this.model.models), function(m) { return m.contents; }));
            var view = new Editor.EModelElementColumnView({ model: packages, parent: this });
            this.$el.append(view.render().$el);
            return this;
        }
    });

    Editor.EModelElementColumnView = Backbone.View.extend({
        template: _.template('<div class="span4 outter-column"><div class="column"></div></div>'),
        initialize: function(attributes) {
            // model is an array
            this.parent = attributes.parent;
        },
        render: function() {
            var el = this.template();
            this.setElement(el);

            _.each(this.model, function(m) {
                var view = new Editor.EModelElementRowView({ model: m });
                $(this.$el.children()[0]).append( view.render().$el );
            }, this);

            return this;
        }
    });

    Editor.EModelElementRowView = Backbone.View.extend({
        template: _.template('<div class="row-fluid erow"><%= name %></div>'),
        events: {
            'mouseover': 'highlight',
            'mouseout': 'unhighlight',
            'click': 'showContent'
        },
        initialize: function(attributes) {
            this.parent = attributes.parent;
            this.contents = this.model.eContents();
        },
        render: function() {
           var el = this.template(this.model.values);
           this.setElement(el);

           return this;
        },
        highlight: function() {
            this.$el.css({background: 'whitesmoke'});
        },
        unhighlight: function() {
            this.$el.css({background: 'white'});
        },
        showContent: function() {
            // this.highlight();
            var parent = this.el.parentNode.parentNode.parentNode, // browser
                child = parent.children, // columns
                position = _.indexOf(child, this.el.parentNode.parentNode);

            // removes the nexts.
            for (var i = position + 1; i < child.length; i++) {
                $(child[i]).remove();
            }

            if (this.contents.length > 0) {
                this.contentView = new Editor.EModelElementColumnView({ model: this.contents });
                this.contentView.render();
                window.metaBrowser.$el.append(this.contentView.$el);
            }

            if (window.currentProperty) {
                window.currentProperty.$el.children().remove();
            }

            if (!this.propertyView) {
                this.propertyView = new Editor.PropertyView({ model: this.model });
            }

            this.propertyView.render();
            window.currentProperty = this.propertyView;

            return this;
        }
    });

    window.metaBrowser = new Editor.MetaBrowserView({model: Ecore.Registry});
    window.metaBrowser.render();

    Editor.PropertyRowView = Backbone.View.extend({
        propertyTemplate: _.template('<tr><td><%= name %></td></tr>'),
        valueTemplate: _.template('<td><div contenteditable><%= value %></div></td>'),
        valueBooleanTemplate: _.template('<td><select><option>true</option><option>false</option></select></td>'),
        render: function() {
            var eFeature = this.model.eFeature,
                model = this.model.eObject,
                html = this.propertyTemplate({name: eFeature.get('name')}),
                value, valueHtml;

            this.setElement(html);

            if (eFeature.get('eType') === Ecore.EcorePackage.EBoolean) {
                value = model.get(eFeature.get('name'));
                valueHtml = this.valueBooleanTemplate({value: value});

                this.$el.append(valueHtml);

                var select = $('td > select', this.$el);
                select.val(value); // init select

                select.change(function(){
                    var changed = $('option:selected', select).val() === 'true';
                    model.set(eFeature.get('name'), changed == 'true');
                    // model.trigger('change');
                });
            } else {
                value = model.get(eFeature.get('name'));
                valueHtml = this.valueTemplate({ value: value});
                this.$el.append(valueHtml);

                var div = $('td > div', this.$el);
                div.on('change', function() {
                    console.log(div.text());
                });
            }
            return this;
        }
    });

    Editor.PropertyView = Backbone.View.extend({
        el: '#property-view',
        template: _.template('<table class="table table-striped"><thead><tr><th style="width: 30%"></th><th style="width: 70%"></th></tr></thead><tbody></tbody></table>'),
        initialize: function(attributes) {},
        render: function() {
            this.$el.children().remove();
            var html = this.template();
            this.$el.append(html);

            var attrs = _.filter(this.model.eClass.eAllStructuralFeatures(), function(f) {
                return f.isTypeOf('EAttribute') && this.isSet(f.get('name'));
            }, this.model);

            _.each(attrs, function(attr) {
                var view = new Editor.PropertyRowView({
                    model: {
                        eFeature: attr,
                        eObject: this.model
                    }
                });
                view.render();
                $('table > tbody', this.$el).append(view.$el);
            }, this);

            return this;
        }
    });

    // Models

    Editor.ResourceModel = Backbone.Model.extend({

        initialize: function(attributes) {

        },

        parse: function() {

        },

        toJSON: function() {

        }

    });

});
