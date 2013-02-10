
/**
 * @name Tree
 * @class Display Ecore elements in a Tree.
 *
 */
Edit.Tree = Backbone.View.extend(/** @lends Tree.prototype */ {
    template: _.template('<table class="tree-table"></table>'),
    tableTmpl: _.template('<colgroup><col></colgroup><tbody></tbody>'),

    initialize: function(attributes) {
        this.selected = null;
        this.nodes = [];
    },

    render: function() {
        if (!this.$body) {
            this.setElement(this.template());
            this.$el.append(this.tableTmpl());
            this.$tbody = $('tbody', this.$el);

            var previous, current;
            this.model.get('contents').each(this.addNode, this);
        }

        return this;
    },

    addNode: function(model) {
        var previous = _.last(this.nodes);
        var view = new Edit.TreeNode({ model: model, tree: this, margin: 0 });
        if (previous) previous.next = view;

        this.nodes.push(view);
        view.render();
        this.$tbody.append(view.$el);
    },

    expand: function() {
        if (this.$frame) {
            this.$frame.expand();
        }
    },

    setSelection: function(view) {
        if (this.selected) {
            this.selected.deselect();
            this.trigger('deselect', this.selected);
        }
        this.selected = view;
        this.trigger('select', this.selected);
    },

    remove: function() {
        if (this.$body) this.$body.remove();
        _.each(this.nodes, function(node) { node.remove(); });
        Backbone.View.prototype.remove.apply(this);
    }
});

