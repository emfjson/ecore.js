/*

 TreeView

 <div class="tree">
     <ul>
     </ul>
 </div>

*/

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

