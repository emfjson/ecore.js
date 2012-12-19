
// TreeEditor

var DemoTreeEditorView = Ecore.Editor.EditorView.extend({
    templateMenuBar: _.template('<div class="row-fluid"></div>'),

    initialize: function(attributes) {
        this.tree = new Ecore.Editor.TreeView({ model: this.model });
        this.tree.on('select', function() { this.trigger('select', this.tree.currentSelection.model); }, this);
        Ecore.Editor.EditorView.prototype.initialize.apply(this, [attributes]);
    },

    renderContent: function() {
        if (!this.menuBar) {
            this.menuBar = this.createMenuBar();
            this.menuBar.render();
        }
        this.$el.append(this.menuBar.$el);
        this.tree.model = this.model;
        this.tree.render();
        this.$el.append(this.tree.$el);
        this.tree.show();
        return this;
    },

    createMenuBar: function() {
        var html = this.templateMenuBar();
        var view = this;

        var AddButton = new Ecore.Editor.MenuBarDropDownButton({
            label: 'add',
            click: function() {
                var selection = view.tree.currentSelection;
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
                        this.addItem(new Ecore.Editor.Separator());
                    }

                    _.each(siblings, function(type) {
                        this.addItem(new Ecore.Editor.DropDownItem({ label: 'Sibling ' + type.get('name') }));
                    }, this);
                }

                _.each(this.items, this.renderItem, this);
            }
        });

        var RemoveButton = new Ecore.Editor.MenuBarButton({
            label: 'remove',
            click: function() {
                console.log('remove', this);
            }
        });

        var menuBar = new Ecore.Editor.MenuBar({
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
        item = new Ecore.Editor.DropDownItem({
            label: 'Child ' + type.get('name'),
            model: type,
            click: function() {
                console.log('click me', this);
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

