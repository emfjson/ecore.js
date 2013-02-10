/**
 * @name Editor
 * @class
 *
 */
Edit.Editor = Backbone.View.extend(/** @lends Edior.prototype */ {
    _frame: '<div class="editor-frame"></div>',
    _menu: '<div class="editor-menu"></div>',
    _content: '<div class="editor-content-outer"><div class="editor-content"></div></div>',

    initialize: function(attributes) {},

    render: function() {
        var $frame;

        if (!this.$content) {
            this.setElement(this.template({ id: this.cid }));
            this.$el.addClass('editor');
            this.$el.append(this._frame);
            $frame = $('.editor-frame', this.$el);
            $frame.append(this._menu);
            $frame.append(this._content);

            this.$menu = $('.editor-menu', $frame);
            this.$content = $('.editor-content', $frame);

            if (this.$container) {
                this.$container.append(this.$el);
            }

            this.renderContent();
        }

        return this;
    },

    renderContent: function() {},

    remove: function() {
        this.trigger('remove');
        return Backbone.View.prototype.remove.apply(this);
    }

});

/**
 * @name TabEditor
 * @class
 *
 */
Edit.TabEditor = Edit.Editor.extend(/** @lends TabEdior.prototype */ {
    template: _.template('<div class="tab-pane" id="tab-<%= id %>"></div>'),

    initialize: function(attributes) {
        Edit.Editor.prototype.initialize.apply(this, [attributes]);
        this.tab = new Edit.Tab({ eid: this.cid, model: this.model });
        this.tab.on('remove', this.remove);
    },

    render: function() {
        Edit.Editor.prototype.render.apply(this);

        if (this.$tabs) {
            this.$tabs.append(this.tab.render().$el);
        }

        return this;
    },

    show: function() {
         $('a[href="#tab-' +  this.cid + '"]', this.$tabs).tab('show');
    }

});


/**
 * @name TreeTabEdior
 * @class
 *
 */
Edit.TreeTabEdior = Edit.TabEditor.extend(/** @lends TreeTabEdior.prototype */ {
    _menuGroup: '<div class="btn-group"></div>',

    initialize: function(attributes) {
        _.bindAll(this);
        Edit.TabEditor.prototype.initialize.apply(this, [attributes]);
        this.tree = new Ecore.Edit.Tree({ model: this.model });
    },

    renderContent: function() {
        this.$content.append(this.tree.render().$el);
        this.$menu.append(this._createMenu());
    },

    addElement: function(e) {
        var selection = this.tree.selected;
        if (!selection) return;

        var menu = this.add;
        var model = selection.model;
        var child = model.eClass.get('eAllContainments');
        var eContainingFeature = model.eContainingFeature;

        menu.removeItem();
        _.each(child, function(c) {
            createChildItems.apply(menu, [c, model]);
        });

        if (eContainingFeature) {
            var eType = eContainingFeature.get('eType');
            var siblings = eType.get('abstract') ? eType.get('eAllSubTypes') : [eType];
            var label, item;

            if (child.length > 0) menu.addItem(new Edit.Separator());

            _.each(siblings, function(type) {
                label = 'Sibling ' + type.get('name');
                item = new Edit.DropDownItem({ label: label });
                menu.addItem(item);
            });
        }

        _.each(menu.items, menu.renderItem, menu);
    },

    removeElement: function() {
        console.log('remove');
    },

    _createMenu: function() {
        var $group = $(this._menuGroup);

        this.add = new Edit.MenuBarDropDownButton({ label: 'add', size: 'small' });
        this.remove = new Edit.MenuBarButton({ label: 'remove', size: 'small' });
        this.edit = new Edit.MenuBarButton({ label: 'edit', size: 'small' });

        this.add.on('click', this.addElement);
        this.remove.on('click', this.removeElement);

        $group.append(this.add.render().$el)
            .append(this.remove.render().$el)
            .append(this.edit.render().$el);

        return $group;
    }
});


/*
 * Helper functions
 */

function createChildItems(feature, model) {
    var eType = feature.get('eType');
    var types = eType.get('abstract') ? eType.get('eAllSubTypes') : [eType];
    var item, label;

    _.each(types, function(type) {
        label = 'Child ' + type.get('name');
        item = new Edit.DropDownItem({ label: label, model: type });

        item.on('click', function() {
            if (feature.get('upperBound') === 1) {
                model.set(feature.get('name'), type.create());
            } else {
                model.get(feature.get('name')).add(type.create());
            }
        });

        this.addItem(item);
    }, this);
}

