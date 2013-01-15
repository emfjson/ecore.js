
// TreeEditor

var DemoTreeEditorView = Ecore.Edit.EditorView.extend({
    templateMenuBar: _.template('<div class="row-fluid"></div>'),

    initialize: function(attributes) {
        this.tree = new Ecore.Edit.TreeView({ model: this.model });
        this.tree.on('select', function() {
            this.trigger('select', this.tree.selected.model);
        }, this);
        Ecore.Edit.EditorView.prototype.initialize.apply(this, [attributes]);
    },

    renderContent: function() {
        if (!this.menuBar) {
            this.menuBar = this.createMenuBar();
            this.menuBar.render();
        }
        // clear and redraw the tree
        $('div[class="tree"]', this.$el).remove();
        this.$el.append(this.menuBar.$el);
        this.tree.model = this.model;
        this.tree.render();
        this.$el.append(this.tree.$el);
        return this;
    },

    createMenuBar: function() {
        var html = this.templateMenuBar();
        var view = this;

        var AddButton = new Ecore.Edit.MenuBarDropDownButton({
            label: 'add',
            click: function() {
                var selection = view.tree.selected;
                if (!selection) return;

                var model = selection.model;
                var child = model.eClass.get('eAllContainments');
                var eContainingFeature = model.eContainingFeature;

                this.removeItem();

                _.each(child, function(c) {  createChildItems.apply(this, [c, model]); }, this);

                if (eContainingFeature) {
                    var eType = eContainingFeature.get('eType');
                    var siblings = eType.get('abstract') ? eType.get('eAllSubTypes') : [eType];

                    if (child.length > 0) {
                        this.addItem(new Ecore.Edit.Separator());
                    }

                    _.each(siblings, function(type) {
                        this.addItem(new Ecore.Edit.DropDownItem({ label: 'Sibling ' + type.get('name') }));
                    }, this);
                }

                _.each(this.items, this.renderItem, this);
            }
        });

        var RemoveButton = new Ecore.Edit.MenuBarButton({
            label: 'remove',
            click: function() {
                console.log('remove', this);
            }
        });

        var menuBar = new Ecore.Edit.MenuBar({
            el: html,
            buttons: [AddButton, RemoveButton]
        });

        return menuBar;
    }
});

function createChildItems(feature, model) {
    var eType = feature.get('eType');
    var types = eType.get('abstract') ? eType.get('eAllSubTypes') : [eType];
    var item;

    _.each(types, function(type) {
        item = new Ecore.Edit.DropDownItem({
            label: 'Child ' + type.get('name'),
            model: type,
            click: function() {
                if (feature.get('upperBound') === 1) {
                    model.set(feature.get('name'), type.create());
                } else {
                    model.get(feature.get('name')).add(type.create());
                }
            }
        });
        this.addItem(item);
    }, this);
}

// EditorTabs

var DemoEditorTabView = Ecore.Edit.EditorTabView.extend({
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

