
var MButton = Edit.MenuBarButton;

Edit.ExplorerWindow = Edit.Window.extend({
    menuBarTemplate: _.template('<div class="row-fluid"></div>'),
    explorerTemplate: _.template('<div class="row-fluid"></div>'),
    selectRootTemplate: _.template('<% _.each(classes, function(c) { %> <option> <%= c.get("name") %> </option> <% }); %>'),

    initialize: function(attributes) {
        Edit.Window.prototype.initialize.apply(this, [attributes]);
    },

    renderMenuBar: function() {
        var html = this.menuBarTemplate();
        this.menu = new Edit.MenuBar({
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
        this.tree = new Edit.TreeView({
            el: html,
            model: this.model
        });
        this.tree.render();
        this.$content.append(this.tree.$el);
        this.tree.show();
    },

    render: function() {
        Edit.Window.prototype.render.apply(this);
        this.remove();
        this.renderMenuBar();
        this.renderTree();

        return this;
    },

    remove: function() {
        Edit.Window.prototype.remove.call(this);
        if (this.$content) {
            this.$content.children().remove();
        }

        return this;
    }

});

