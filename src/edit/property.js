
    var PropertyWindow = Ecore.Editor.PropertyWindow = Ecore.Editor.Window.extend({
        contentTemplate: _.template('<table class="table table-striped"><thead><tr><th style="width: 30%"></th><th style="width: 70%"></th></tr></thead><tbody></tbody></table>'),

        initialize: function(attributes) {
            Ecore.Editor.Window.prototype.initialize.apply(this, [attributes]);
            this.views = [];
        },

        renderTable: function() {
            if (!this.model || !this.model.eClass) return;

            var html = this.contentTemplate(),
                attrs = _.filter(this.model.eClass.get('eAllAttributes'), function(f) { return !f.get('derived'); }),
                refs = _.filter(this.model.eClass.get('eAllReferences'), function(f) { return !f.get('derived'); });

            this.$content.append(html);

            this.views.push(new PropertyRowView({
                model: { eFeatureName: 'eClass', eObject: this.model, value: this.model.eClass }
            }));

            _.each(attrs, function(attr) {
                this.views.push(new PropertyRowView({
                    model: { eFeature: attr, eObject: this.model }
                }));
            }, this);

            _.each(refs, function(ref) {
                this.views.push(new PropertyRowView({
                    model: { eFeature: ref, eObject: this.model }
                }));
            }, this);

            _.each(this.views, function(v) {
                v.render();
                $('table > tbody', this.$el).append(v.$el);
            });
        },

        render: function() {
            Ecore.Editor.Window.prototype.render.apply(this);
            this.remove();
            this.renderTable();
            return this;
        },

        remove: function() {
             _.each(this.views, function(v) { v.remove(); });
            this.views.length = 0;
            if (this.$content) {
                this.$content.children().remove();
            }

            return this;
        }
    });


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


    var TextView = Backbone.View.extend({
        template: _.template('<div contenteditable><%= value %></div>'),
        render: function() {
            var html = this.template({ value: this.model });
            this.setElement(html);

            var view = this;
            this.$el.on('change', function() {
                view.trigger('change', view.$el.text());
            });

            return this;
        }
    });

    var DateView = Backbone.View.extend({});

    var SelectView = Backbone.View.extend({
        template: _.template('<% if (many) { %> <div class=""> <% } %> <select <% if (many) { %> multiple="multiple" <% } %> > <% _.each(options, function(opt) { %><option><%= opt.eClass ? opt.label() : opt %></option><% }); %></select> <% if (many) { %> </div><div class="btn-group"><a class="btn-mini"><i class="icon-plus"></i></a><a class="btn-mini"><i class="icon-remove"></i></a></div> <% } %>'),
        initialize: function(attributes) {
            this.value = attributes.value;
            this.many = attributes.many || false;
        },
        render: function() {
            var html = this.template({ options: this.model, value: this.value, many: this.many });
            this.setElement(html);
            this.$el.val(this.value ? this.value.eClass ? this.value.label() : this.value : null); // init select

            var view = this;
            this.$el.change(function() {
                var changed = $('option:selected', view.$el).val();
                view.trigger('change', changed);
            });
            return this;
        }
    });

    var PropertyRowView = Ecore.Editor.PropertyRowView = Backbone.View.extend({
        propertyTemplate: _.template('<tr><td><%= name %></td></tr>'),
        valueTemplate: _.template('<td></td>'),

        initialize: function() {
            this.eFeature = this.model.eFeature;
            this.eFeatureName = this.model.eFeatureName || this.eFeature.get('name');
            this.value = this.model.value;
            this.eType = this.eFeature ? this.eFeature.get('eType') : null;
        },

        render: function() {
            var eFeature = this.eFeature,
                eFeatureName = this.eFeatureName,
                eType = this.eType,
                model = this.model.eObject,
                value = this.value || model.get(eFeatureName),
                html = this.propertyTemplate({ name: eFeatureName }),
                valueView;

            this.setElement(html);

            if (!eFeature) {
                valueView = new SelectView({ model: [value], value: value, many: false });
                valueView.on('change', function(changed) {
                    console.log(changed);
                });
            } else {

            if (eFeature.get('upperBound') !== 1) {
                valueView = new SelectView({
                    model: eFeature.get('derived') ? value : value.array(),
                    value: value,
                    many: true
                });
            } else {
                if (eFeature.isTypeOf('EAttribute')) {
                    if (eType === Ecore.EBoolean) {
                        valueView = new SelectView({ model: ['true', 'false'], value: value });
                        valueView.on('change', function(changed) {
                            model.set(eFeatureName, changed);
                            model.trigger('change');
                            model.eResource().trigger('change', model);
                        });
                    } else {
                        valueView = new TextView({ model: value });
                        valueView.on('change', function(changed) {
                            model.set(eFeatureName, changed);
                            model.trigger('change');
                            model.eResource().trigger('change', model);
                        });
                    }
                } else {
                    valueView = new SelectView({ model: value ? [value] : [], value: value });
                }
            }

            }

            if (valueView) {
                valueView.render();
                var td = $(document.createElement('td'));
                td.append(valueView.$el);
                this.$el.append(td);
            }

            return this;
        },

        remove: function() {
            this.$el.remove();

            return this;
        }

    });

