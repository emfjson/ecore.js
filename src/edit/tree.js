
    var TreeView = Ecore.Editor.TreeView = Backbone.View.extend({
        template: _.template('<div class="tree"></div>'),

        initialize: function(attributes) {
            _.bindAll(this, 'render', 'remove');
            this.properties = attributes.properties;
            this.el = attributes.el;

            this.on('select', function(view) {
                if (this.currentSelection && this.currentSelection !== view) {
                    this.currentSelection.deselect();
                }
                this.currentSelection = view;
            }, this);
        },

        render: function() {
            this.remove();
            this.views = [];

            var html = this.template();
            _.each(_.isArray(this.model) ? this.model : [this.model], function(e) {
                var view = new TreeNodeView({ model: e, tree: this });
                this.views.push(view);
            }, this);

            this.setElement(html);

            return this;
        },

        show: function() {
            _.each(this.views, function(v) {
                v.render();
                this.$el.append(v.$el);
            }, this);
            return this;
        },

        remove: function() {
            this.$el.children().remove();
            return this;
        }

    });

    var TreeNodeView = Ecore.Editor.TreeNodeView = Backbone.View.extend({
        template: _.template('<ul class="tree-node <% if ( root ) { %> tree-root <% } %>"></ul>'),
        innerTemplate: _.template('<li><div><span class="icon-chevron-right"></span><span class="state"><span class="icon-tree-<%= eClass %> folder"></span><%= name %></span></div></li>'),
        initialize: function(attributes) {
            _.bindAll(this, 'render', 'expand', 'select', 'innerRender');
            this.expanded = false;
            this.tree = attributes.tree;
        },

        expand: function() {
            var contents = this.model.eContents();
            if (_.isEmpty(contents)) return this;

            if (this.expanded) {
                this.$el.children().remove();
                this.innerRender();
                this.expanded = false;
            } else {
                _.each(contents, function(e) {
                    var view = new TreeNodeView({ model: e, tree: this.tree });
                    view.render();
                    this.$el.append(view.$el);
                }, this);

                this.expanded = true;
            }

            return this;
        },

        render: function() {
            var eContainer = this.model.eContainer;
            var html = this.template({root: eContainer ? eContainer.isTypeOf('Resource') : true });
            this.setElement(html);

            return this.innerRender();
        },

        innerRender: function() {
            var html = this.innerTemplate({
                eClass: this.model.eClass.get('name'),
                name: this.model.label(),
                icon: this.model.eContents().length === 0 ? "-" : "+"
            });
            this.$el.append(html);

            var view = this;
            $('div > span[class*="icon-chevron-right"]', this.$el).click(function() { view.expand(); });

            if (!this.properties && Ecore.Editor.PropertyView) {
                 this.properties = new Ecore.Editor.PropertyView({ model: this.model });
             }

            $('div', this.$el).mouseover(function() {
                if (view.tree.currentSelection !== view)
                    $('div > span[class*="state"]:first', view.$el).addClass('tree-over');
            });

             $('div', this.$el).mouseout(function() {
                $('div > span[class*="state"]:first', view.$el).removeClass('tree-over');
            });

            $('div', this.$el).click(function() {
                view.select();
                if (view.properties) {
                    view.properties.remove();
                    view.properties.render();
                }
            });

            return this;
        },

        deselect: function() {
            $('div > span[class*="state"]:first', this.$el).removeClass('tree-selected');
            this.tree.trigger('deselect', this);

            return this;
        },

        select: function() {
            $('div > span[class*="state"]:first', this.$el).addClass('tree-selected');
            this.tree.trigger('select', this);

            return this;
        }

    });

