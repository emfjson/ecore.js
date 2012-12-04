
    Ecore.Editor._views = [];

    function findView(cid) {
        return _.find(Ecore.Editor._views, function(v) {
            return v.cid === cid;
        });
    }

    Ecore.Editor.Workbench = {
        windows: [],
        add: function(window) {
            this.windows.push(window);
        }
    };

    Ecore.Editor.EditorWindow = Ecore.Editor.Window.extend({
        intialize: function(attributes) {
            Ecore.Editor.Window.prototype.initialize.call(this, attributes);
        },

        renderEditor: function() {
            this.editor = new Ecore.Editor.TreeTabEditor({
                model: this.model
            });
            this.editor.render();
            this.$content.append(this.editor.$el);

            return this;
        },

        render: function() {
            Ecore.Editor.Window.prototype.render.call(this);
            this.renderEditor();

            return this;
        }
    });

    Ecore.Editor.TabEditor = Backbone.View.extend({
        elementTemplate: _.template('<div><div class="tabbable"><ul class="nav nav-tabs"></ul><div class="tab-content"></div></div></div>'),
        template: _.template('<li><a href="#tab-<%= id %>" data-toggle="tab"> <%= uri %> <i class="icon-remove-circle"></i> </a></li>'),
        templateTab: _.template('<div class="tab-pane" id="tab-<%= id %>"></div>'),

        initialize: function(attributes) {
            _.bindAll(this, 'render', 'active', 'remove');
            Ecore.Editor._views.push(this);
        },

        render: function() {
            var uri = this.model.uri,
                elHtml = this.elementTemplate(),
                html = this.template({ id: this.cid, uri: uri }),
                tabHtml = this.templateTab({ id: this.cid, uri: uri });

            this.setElement(elHtml);

            $('.tabbable > .nav-tabs', this.$el).append(html);
            $('.tab-content', this.$el).append(tabHtml);

            this.$content = $('.tab-content > #tab-'+ this.cid, this.$el);

            // render content, extend in subClasses
            this.renderContent(this.cid);

            this.$a = $('li > a[href="#tab-' + this.cid + '"]', this.$el);
            this.$tab = $('#tab-' + this.cid, this.$el);

            this.$a.click(this.active);
            this.$a.on('shown', function(e) {
                var target = findView(e.target.href.split('-')[1]);
                if (target) {
                    target.selected = true;
                }
                if (e.relatedTarget) {
                    var related = findView(e.relatedTarget.href.split('-')[1]);
                    if (related) {
                        related.selected = false;
                    }
                }
            });

            var view = this;
            $('i', this.$a).click(function() {
                view.remove();
                $('#editor a:first').tab('show');
            });

            this.$el.tab('show');

            return this;
        },

        active: function() {
            this.$el.tab('show');
        },

        remove: function() {
            this.$a.remove();
            this.$tab.remove();
        }

    });

    Ecore.Editor.TreeTabEditor = Ecore.Editor.TabEditor.extend({
        menuBarTemplate: _.template('<div class="row-fluid"></div>'),
        contentTemplate: _.template('<div class="row-fluid"><div class="pointer tree-node" id="tree-<%= id %>"></div></div>'),

        initialize: function(attributes) {
            _.bindAll(this, 'render', 'active');
            Ecore.Editor._views.push(this);
            this._window = attributes._window;
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

                            var model = selection.model,
                                child = model.eClass.eAllContainments(),
                                eContainingFeature = model.eContainingFeature;

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

