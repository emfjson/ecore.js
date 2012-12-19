

var DemoTreeEditorView = Ecore.Editor.EditorView.extend({
    initialize: function(attributes) {
        this.tree = new Ecore.Editor.TreeView({ model: this.model });
        this.tree.on('select', function() { this.trigger('select', this.tree.currentSelection.model); }, this);
        Ecore.Editor.EditorView.prototype.initialize.apply(this, [attributes]);
    },
    renderContent: function() {
        this.tree.model = this.model;
        this.tree.render();
        this.$el.append(this.tree.$el);
        this.tree.show();
        return this;
    }
});


var DemoEditorTabView = Ecore.Editor.EditorTabView.extend({
    el: '#editor',
    open: function(model) {
        var editor = this.getEditor(model);
        if (!editor) {
            editor = new DemoTreeEditorView({ model: model });
            editor.on('select', function(e) { this.trigger('select', e); }, this);
            this.addEditor(editor);
        }
        editor.render().show();
    }
});

