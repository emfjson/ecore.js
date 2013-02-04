Edit.TreeView = Backbone.View.extend({
    template: _.template('<div class="tree-frame"></div>'),
    initialize: function(attributes) {
        _.bindAll(this, 'render');
        this.menu = new Edit.TreeViewMenu({ tree: this, model: this.model });
        this.content = new Edit.TreeViewContent({ tree: this, model: this.model });
    },
    render: function() {
        var html = this.template();
        this.menu.render();
        this.content.render();
        this.$el.append(html);
        this.$frame = $('.tree-frame', this.$el);
        this.$frame.append(this.menu.$el).append(this.content.$el);

        return this;
    },
    expand: function() {
        if (this.$frame) {
            this.$frame.expand();
        }
    }
});

Edit.TreeViewMenu = Backbone.View.extend({
    template: _.template('<div class="tree-menu"></div>'),
    render: function() {
        var html = this.template();
        this.setElement(html);
        return this;
    }
});

Edit.TreeViewContent = Backbone.View.extend({
    template: _.template('<div class="tree-content-outer"><div class="tree-content"><table class="tree-table"></table></div></div>'),
    tableTmpl: _.template('<colgroup><col width="24px"><col><col width="24px"></colgroup><tbody></tbody>'),

    initialize: function(attributes) {
        this.tree = attributes.tree;
        this.items = [];
    },
    render: function() {
        if (!this.$table) {
            var html = this.template();
            this.setElement(html);
            this.$table = $('.tree-table', this.$el);
            this.$table.append(this.tableTmpl());
            this.$tbody = $('tbody', this.$table);

            var previous, current;
            this.model.get('contents').each(function(item) {
                current = new Edit.TreeNodeView({ model: item, tree: this.tree, display: this, margin: 0 });
                if (!previous) previous = current;
                previous.next = current;
                current.previous = previous;
                previous = current;
                this.items.push(current);
                current.render();
                this.$tbody.append(current.$el);
                    //                    this.$tbody[0].insertBefore(current.$el[0], current.children[0].$el[0]);
            }, this);
        }

        return this;
    }
});

/*

 TreeView

 <div class="tree">
     <ul>
     </ul>
 </div>

*

Edit.TreeView = Backbone.View.extend({
    template: _.template('<div class="tree"><ul></ul></div>'),

    selected: null,

    initialize: function(attributes) {
        this.children = [];
    },
    render: function() {
        if (!this.model) return this;

        if (!this.$content) {
            var html = this.template();
            this.setElement(html);
            this.$children = $('ul', this.$el);
        }

        this.$children.children().remove();
        var contents = this.model.eContents();
        _.each(contents, this.addChildren, this);

        if (this.children.length > 0) {
            this.children[0].select();
        }

        return this;
    },
    addChildren: function(child) {
        var view = new Edit.TreeNodeView({ model: child, tree: this });
        view.render();
        this.children.push(view);
        this.$children.append(view.$el);
        return view;
    },
    setSelection: function(view) {
        if (this.selected) {
            this.selected.deselect();
            this.trigger('deselect', this.selected);
        }
        this.selected = view;
        this.trigger('select', this.selected);
    }
});
*/
