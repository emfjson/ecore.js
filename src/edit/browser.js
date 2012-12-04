
    Ecore.Editor.MetaBrowserView = Backbone.View.extend({
        el: '#class-columns',
        render: function() {
            var packages = _.flatten(_.map(_.values(this.model.models), function(m) { return m.contents; }));
            var view = new Ecore.Editor.EModelElementColumnView({ model: packages, parent: this });
            this.$el.append(view.render().$el);
            return this;
        }
    });

    Ecore.Editor.EModelElementColumnView = Backbone.View.extend({
        template: _.template('<div class="span4 outter-column"><div class="column"></div></div>'),
        initialize: function(attributes) {
            // model is an array
            this.parent = attributes.parent;
        },
        render: function() {
            var el = this.template();
            this.setElement(el);

            _.each(this.model, function(m) {
                var view = new Ecore.Editor.EModelElementRowView({ model: m });
                $(this.$el.children()[0]).append( view.render().$el );
            }, this);

            return this;
        }
    });

    Ecore.Editor.EModelElementRowView = Backbone.View.extend({
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
                this.contentView = new Ecore.Editor.EModelElementColumnView({ model: this.contents });
                this.contentView.render();
                window.metaBrowser.$el.append(this.contentView.$el);
            }

            if (window.currentProperty) {
                window.currentProperty.$el.children().remove();
            }

            if (!this.propertyView) {
                this.propertyView = new Ecore.Editor.PropertyView({ model: this.model });
            }

            this.propertyView.render();
            window.currentProperty = this.propertyView;

            return this;
        }
    });

