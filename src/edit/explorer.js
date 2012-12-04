
    var MButton = Ecore.Editor.MenuBarButton;

    var ExplorerWindow = Ecore.Editor.ExplorerWindow = Ecore.Editor.Window.extend({
        menuBarTemplate: _.template('<div class="row-fluid"></div>'),
        explorerTemplate: _.template('<div class="row-fluid"></div>'),
        selectRootTemplate: _.template('<% _.each(classes, function(c) { %> <option> <%= c.get("name") %> </option> <% }); %>'),

        initialize: function(attributes) {
            Ecore.Editor.Window.prototype.initialize.apply(this, [attributes]);
        },

        renderMenuBar: function() {
            var html = this.menuBarTemplate();
            this.menu = new Ecore.Editor.MenuBar({
                el: html,
                buttons: [
                    new MButton({ label: 'add' }),
                    new MButton({ label: 'remove' }),
                    new MButton({ label: 'edit' }),
                    new MButton({ label: 'diagram' })
                ]
            });

            this.menu.render();
            this.$content.append(this.menu.$el);
        },

        renderTree: function() {
            var html = this.explorerTemplate();
            this.tree = new Ecore.Editor.TreeView({
                el: html,
                model: this.model
            });
            this.tree.render();
            this.$content.append(this.tree.$el);
            this.tree.show();
        },

        render: function() {
            Ecore.Editor.Window.prototype.render.apply(this);
            this.remove();
            this.renderMenuBar();
            this.renderTree();

            return this;
        },

        remove: function() {
            Ecore.Editor.Window.prototype.remove.call(this);
            if (this.$content) {
                this.$content.children().remove();
            }

            return this;
        }

    });

