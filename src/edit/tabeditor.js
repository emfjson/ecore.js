
function lastSegment(uri) {
    var idx = uri.lastIndexOf('/') + 1;

    return uri.slice(idx, uri.length);
}

var EditorTabView = Ecore.Editor.EditorTabView = Backbone.View.extend({
    template: _.template('<ul class="nav nav-tabs"></ul> <div class="tab-content"></div>'),

    initialize: function(attributes) {
        this.editors = [];
    },

    render: function() {
        if (!this.$content && !this.$tabs) {
            var html = this.template();
            this.$el.addClass('tabbable');

            this.$el.append(html);

            this.$content = $('.tab-content', this.$el);
            this.$tabs = $('.nav-tabs', this.$el);
        }

        _.each(this.editors, function(e) { e.render(); });

        return this;
    },

    addEditor: function(editor) {
        if (this.$content && this.$tabs) {
            editor.$container = this.$content;
            editor.$tabs = this.$tabs;
            this.editors.push(editor);

            editor.on('remove', function() { this.suppress(editor); }, this);
        }
    },

    getEditor: function(model) {
        return _.find(this.editors, function(e) { return e.model === model; });
    },

    suppress: function(editor) {
        this.editors = _.without(this.editors, editor);
    },

    show: function(editor) {
        this.getEditor(editor).show();
    }

});

var TabView = Backbone.View.extend({
    template: _.template('<li><a href="#tab-<%= id %>" data-toggle="tab"> <%= title %> <i class="icon-remove-circle"></i> </a></li>'),

    events: {
        'click a > i[class="icon-remove-circle"]': 'remove'
    },

    initialize: function(attributes) {
        this.eid = attributes.eid;
        this._rendered = false;
    },

    render: function() {
        if (!this._rendered) {
            var title = lastSegment(this.model.get('uri'));
            var html = this.template({ id: this.eid, title: title });
            this.setElement(html);
            this._rendered = true;
        }
        return this;
    },

    remove: function() {
        this.trigger('remove');
        Backbone.View.prototype.remove.apply(this);
    }
});

var EditorView = Ecore.Editor.EditorView = Backbone.View.extend({
    template: _.template('<div class="tab-pane" id="tab-<%= id %>"></div>'),

    initialize: function(attributes) {
        _.bindAll(this, 'render', 'remove');
        if (attributes && attributes.$container && attributes.$tabs) {
            this.$container = attributes.container;
            this.$tabs = attributes.tabs;
        }
        this.tab = new TabView({ eid: this.cid, model: this.model });
        this.tab.on('remove', this.remove);
        this._rendered = false;
    },

    render: function() {
        if (!this._rendered) {
            var html = this.template({ id: this.cid });
            this.setElement(html);

            this.$container.append(this.$el);
            this.$tabs.append(this.tab.render().$el);
            this._rendered = true;
        }

        this.renderContent();

        return this;
    },

    renderContent: function() {},

    show: function() {
        $('a[href="#tab-' +  this.cid + '"]', this.$tabs).tab('show');
    },

    remove: function() {
        this.trigger('remove');
        Backbone.View.prototype.remove.apply(this);
    }

});

/*
Ecore.Editor.TreeTabEditor = Ecore.Editor.TabEditor.extend({
    menuBarTemplate: _.template('<div class="row-fluid"></div>'),
    contentTemplate: _.template('<div class="row-fluid"><div class="pointer tree-node" id="tree-<%= id %>"></div></div>'),

    initialize: function(attributes) {
        _.bindAll(this, 'render', 'active');
//        Ecore.Editor._views.push(this);
//        this._window = attributes._window;
    },

    renderMenuBar: function() {
        var html = this.menuBarTemplate();

        var view = this;
        this.menuBar = new Ecore.Editor.MenuBar({
            el: html,
            buttons: [
                new Ecore.Editor.MenuBarDropDownButton({
                    label: 'add',
                    click: function() {
                        var selection = view.tree.currentSelection;
                        if (!selection) return;

                        var model = selection.model;
                        var child = model.eClass.eAllContainments();
                        var eContainingFeature = model.eContainingFeature;

                        this.removeItem();

                        _.each(child, function(feature) {
                            var eType = feature.get('eType'),
                                types = eType.get('abstract') ? eType.eAllSubTypes() : [eType];

                            _.each(types, function(type) {
                                this.addItem(new Ecore.Editor.DropDownItem({ label: 'Child ' + type.get('name') }));
                            }, this);

                        }, this);

                var siblings;
                if (eContainingFeature) {
                    var eType = eContainingFeature.get('eType');
                        siblings = eType.get('abstract') ? eType.eAllSubTypes() : [eType];

                    if (child.length > 0) {
                        this.addItem(new Ecore.Editor.Separator());
                    }

                    _.each(siblings, function(type) {
                        this.addItem(new Ecore.Editor.DropDownItem({ label: 'Sibling ' + type.get('name') }));
                    }, this);
            }

            _.each(this.items, this.renderItem, this);
            }
            }),
                new Ecore.Editor.MenuBarButton({
                    label: 'remove',
                click: function() {}
                })
        ]
        });

        this.menuBar.render();
        this.$content.append(this.menuBar.$el);
    },

    renderContent: function(id) {
        this.renderMenuBar();

        html = this.contentTemplate({ id: id });

        this.tree = new Ecore.Editor.TreeView({
            el: $('#tree-' + id, $(html)),
            model: this.model
        });

        this.tree.render();
        this.tree.show();

        this.$content.append(this.tree.$el);

        var view = this,
            add = $('div > div > a[class*="add"]', this.$content);

        add.click(function() {
            view.showAddMenu(view.tree.currentSelection);
        });

        return this;
    },

    createSibling: function(eClass) {
        var eo = Ecore.create(eClass);
        this.tree.currentSelection.eContainer.get(
                this.tree.currentSelection.eContainingFeature.get('name')).add(eo);

        return eo;
    },

    createChild: function(eClass, eFeature) {
        var eo = Ecore.create(eClass);
        this.tree.currentSelection.get(eFeature.get('name')).add(eo);

        return eo;
    }

});

*/
