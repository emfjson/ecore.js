(function() {

    Ecore.Editor = {};

    var label = function() {
        var label = this.has('name') ? this.get('name') : this.get('uri');
        return this.eClass.get('name') + label ? ' ' + label : '';
    };

    Ecore.EObject.get('eOperations').add(
        Ecore.EOperation.create({
            name: 'label',
            eType: Ecore.EString,
            upperBound: 1,
            lowerBound: 0,
            _: label
        }
    ));

    _.each(Ecore.Registry.models(), function(m) {
        m.label = label;
        m.get('contents').each(function(p) {
            p.label = label;
            p.get('eClassifiers').each(function(c) {
                c.label = label;
                if (c.has('eStructuralFeatures')) {
                    c.get('eStructuralFeatures').each(function(f) {
                        f.label = function() {
                            return this.get('name') + ' : ' + this.get('eType').get('name');
                        };
                    });
                    c.get('eOperations').each(function(f) {
                        f.label = function() {
                            return this.get('name') + '()' + (this.isSet('eType') ? ' : ' + this.get('eType').get('name') : '');
                        };
                    });
                }
            });
        });
    });



    function draggable(element) {
        var header = $('div [class*="window-header"]', $(element));

        header.mousedown(function(e) {
            element.innerX = e.clientX + window.pageXOffset - element.offsetLeft;
            element.innerY = e.clientY + window.pageYOffset - element.offsetTop;

            window.addEventListener('mousemove', move, false);
            window.addEventListener('mouseup', function() {
                window.removeEventListener('mousemove', move, false);
            }, true);

            function move(e) {
                var position = element.style.position;
                element.style.position = 'absolute';
                element.style.left = e.clientX + window.pageXOffset - element.innerX + 'px';
                element.style.top = e.clientY + window.pageYOffset - element.innerY + 'px';
                element.style.position = position;
            }
        });
    }

    function resizable(wd, element) {
        var resizer = $('div[class*="window-resize"]', $(element));

        resizer.mousedown(function(e) {
            element.startX = e.clientX; // + window.pageXOffset - element.offsetLeft;
            element.startY = e.clientY; // + window.pageYOffset - element.offsetTop;

            window.addEventListener('mousemove', move, false);
            window.addEventListener('mouseup', function() {
                window.removeEventListener('mousemove', move, false);
            }, true);

            function move(e) {
                element.ow = element.offsetWidth;
                element.oh = element.offsetHeight;

                var dX = e.clientX - element.startX;
                var dY = e.clientY - element.startY;

                element.startX += dX; // + window.pageXOffset - element.offsetLeft;
                element.startY += dY; // + window.pageYOffset - element.offsetTop;

                var position = element.style.position;
                element.style.position = 'absolute';
                var old = element.ow;
                element.style.width = (element.ow + dX * 0.9) + 'px';
//                element.style.height = (element.oh + dY) + 'px';
                element.style.position = position;
            }
        });
    }

    // Window
    //

    Ecore.Editor.Window = Backbone.View.extend({
        _template: _.template('<div class="row-fluid"><div class="window-header"><span class="window-title"><%= title %></span><span class="window-actions"></span></div><div class="window-content"></div><div class="window-footer"></div></div>'),

        _resizeHandleTemplate: _.template('<div class="window-resize" style="z-index: 1000;"></div>'),

        _closeActionTemplate: _.template('<a href="#" class="window-action"><i class="icon-remove action-close"></i></a>'),
        _minimizeActionTemplate: _.template('<a href="#" class="window-action"><i class="icon-minus action-min"></i></a>'),
        _maximizeActionTemplate: _.template('<a href="#" class="window-action"><i class="icon-plus action-max"></i></a>'),

        events: {
            'click i[class*="action-close"]': 'close',
            'click i[class*="action-min"]': 'minimize',
            'click i[class*="action-max"]': 'maximize'
        },

        initialize: function(attributes) {
            _.bindAll(this, 'render', 'remove', 'close', 'minimize', 'maximize');
            this.parts = attributes.parts;
            this.title = attributes.title || 'Window';
            this.height = attributes.height;
            this.draggable = attributes.draggable;
        },

        render: function() {
            this.remove();

            if (this.$header) return;

            var html = this._template({ title: this.title });

            this.$el.addClass('window');
            this.$el.append(html);
            this.$header = $('div > div[class*="window-header"]', this.$el);

            $('span[class*="window-actions"]', this.$el)
                .append(this._minimizeActionTemplate())
                .append(this._maximizeActionTemplate())
                .append(this._closeActionTemplate());

             $('div[class*="window-footer"]', this.$el).append(this._resizeHandleTemplate());

            this.$content = $('div > div[class*="window-content"]', this.$el);
            if (this.height)  {
                this.$content.css('height', this.height);
            }

            if (this.content) {
                this.content.render();
                this.$content.append(this.content.$el);
            }

            if (this.draggable) {
                draggable( this.$el.get()[0] );
            }

            resizable(this, this.$el.get()[0]);

            return this;
        },

        remove: function() {

        },

        close: function() {
            console.log('closing');
        },

        maximize: function() {
            this.$el.css('left', '0');
            this.$el.css('right', '0');
        },

        minimize: function() {

        }
    });

    Ecore.Editor.SimpleWindow = Ecore.Editor.Window.extend({
        header: _.template('<div></div>'),
        initialize: function(attributes) {
            this.title = attributes.title || 'Window';
            this.height = attributes.height;
            this.draggable = attributes.draggable;
            this.content = attributes.content;
        }
    });



    var MenuBar = Ecore.Editor.MenuBar = Backbone.View.extend({
        template: _.template('<div class="span12 action-bar btn-group"></div>'),
        initialize: function(attributes) {
            this.buttons = attributes.buttons;
        },
        render: function(){
            var html = this.template();
            this.$el.append(html);

            _.each(this.buttons, this.renderButton, this);

            return this;
        },
        renderButton: function(button) {
            button.render();
            $('div[class*="action-bar"]', this.$el).append(button.$el);

            return this;
        }
    });

    // var add = new MenuBarButton({label: 'add', click: function() {}});
    // var bar = new MenuBar({buttons: [add]});

    var MenuBarButton = Ecore.Editor.MenuBarButton = Backbone.View.extend({
        template: _.template('<a class="btn btn-mini"> <%= label %> </a>'),
        events: {
            'click': 'click'
        },
        initialize: function(attributes) {
            _.bindAll(this, 'render', 'click');
            this.label = attributes.label;
            this.clickHandle = attributes.click;
        },
        render: function() {
            var html = this.template({ label: this.label });
            this.setElement(html);

            return this;
        },
        click: function() {
            return this.clickHandle();
        }
    });

    var MenuBarDropDownButton = Ecore.Editor.MenuBarDropDownButton = MenuBarButton.extend({
        template: _.template('<a class="btn btn-mini" data-toggle="dropdown"> <%= label %> <span class="caret"> </span></a><ul class="dropdown-menu"></ul>'),
        initialize: function(attributes) {
            _.bindAll(this, 'render', 'click');
            this.label = attributes.label;
            this.items = attributes.items || [];
            this.clickHandle = attributes.click;
        },
        render: function() {
            var html = this.template({ label: this.label });
            this.setElement(html);

            this.removeItem();
            _.each(this.items, this.renderItem, this);

            return this;
        },
        renderItem: function(item) {
            item.render();
            // append to ul.
            $(this.$el[1]).append(item.$el);

            return this;
        },
        removeItem: function(item) {
            this.items.length = 0;
            $(this.$el[1]).children().remove();

            return this;
        },
        addItem: function(item) {
            this.items.push(item);

            return this;
        }
    });

    var Separator = Ecore.Editor.Separator = Backbone.View.extend({
        template: _.template('<li class="divider"></li>'),
        render: function() {
            var html = this.template();
            this.setElement(html);
            return this;
        }
    });

    var DropDownItem = Ecore.Editor.DropDownItem = Backbone.View.extend({
        template: _.template('<li><a tabindex="-1" href="#"><%= label %></a></li>'),
        events: {
            'click a': 'click'
        },
        initialize: function(attributes) {
            _.bindAll(this, 'render', 'click');
            this.label = attributes.label;
            this.handleClick = attributes.click;
        },
        render: function() {
            var html = this.template({label: this.label});
            this.setElement(html);

            return this;
        },
        click: function() {
            return this.handleClick();
        },
        remove: function() {
        }
    });




    var MButton = Ecore.Editor.MenuBarButton;

    var ExplorerWindow = Ecore.Editor.ExplorerWindow = Ecore.Editor.Window.extend({
        menuBarTemplate: _.template('<div class="row-fluid"></div>'),
        explorerTemplate: _.template('<div class="row-fluid"></div>'),
        selectRootTemplate: _.template('<% _.each(classes, function(c) { %> <option> <%= c.get("name") %> </option> <% }); %>'),

        initialize: function(attributes) {
            Ecore.Editor.Window.prototype.initialize.apply(this, [attributes]);
        },

        renderMenuBar: function() {
            var html = this.menuBarTemplate();
            this.menu = new Ecore.Editor.MenuBar({
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
            this.tree = new Ecore.Editor.TreeView({
                el: html,
                model: this.model
            });
            this.tree.render();
            this.$content.append(this.tree.$el);
            this.tree.show();
        },

        render: function() {
            Ecore.Editor.Window.prototype.render.apply(this);
            this.remove();
            this.renderMenuBar();
            this.renderTree();

            return this;
        },

        remove: function() {
            Ecore.Editor.Window.prototype.remove.call(this);
            if (this.$content) {
                this.$content.children().remove();
            }

            return this;
        }

    });



    var PropertyWindow = Ecore.Editor.PropertyWindow = Ecore.Editor.Window.extend({
        contentTemplate: _.template('<table class="table table-striped"><thead><tr><th style="width: 30%"></th><th style="width: 70%"></th></tr></thead><tbody></tbody></table>'),

        initialize: function(attributes) {
            Ecore.Editor.Window.prototype.initialize.apply(this, [attributes]);
            this.views = [];
        },

        renderTable: function() {
            if (!this.model || !this.model.eClass) return;

            var html = this.contentTemplate(),
                attrs = _.filter(this.model.eClass.get('eAllAttributes'), function(f) { return !f.get('derived'); }),
                refs = _.filter(this.model.eClass.get('eAllReferences'), function(f) { return !f.get('derived'); });

            this.$content.append(html);

            this.views.push(new PropertyRowView({
                model: { eFeatureName: 'eClass', eObject: this.model, value: this.model.eClass }
            }));

            _.each(attrs, function(attr) {
                this.views.push(new PropertyRowView({
                    model: { eFeature: attr, eObject: this.model }
                }));
            }, this);

            _.each(refs, function(ref) {
                this.views.push(new PropertyRowView({
                    model: { eFeature: ref, eObject: this.model }
                }));
            }, this);

            _.each(this.views, function(v) {
                v.render();
                $('table > tbody', this.$el).append(v.$el);
            });
        },

        render: function() {
            Ecore.Editor.Window.prototype.render.apply(this);
            this.remove();
            this.renderTable();
            return this;
        },

        remove: function() {
             _.each(this.views, function(v) { v.remove(); });
            this.views.length = 0;
            if (this.$content) {
                this.$content.children().remove();
            }

            return this;
        }
    });


    $('[contenteditable]').live('focus', function() {
        var $this = $(this);
        $this.data('before', $this.html());
        return $this;
    }).live('blur keyup paste', function() {
        var $this = $(this);
        if ($this.data('before') !== $this.html()) {
            $this.data('before', $this.html());
            $this.trigger('change');
        }
        return $this;
    });


    var TextView = Backbone.View.extend({
        template: _.template('<div contenteditable><%= value %></div>'),
        render: function() {
            var html = this.template({ value: this.model });
            this.setElement(html);

            var view = this;
            this.$el.on('change', function() {
                view.trigger('change', view.$el.text());
            });

            return this;
        }
    });

    var DateView = Backbone.View.extend({});

    var SelectView = Backbone.View.extend({
        template: _.template('<% if (many) { %> <div class=""> <% } %> <select <% if (many) { %> multiple="multiple" <% } %> > <% _.each(options, function(opt) { %><option><%= opt.eClass ? opt.label() : opt %></option><% }); %></select> <% if (many) { %> </div><div class="btn-group"><a class="btn-mini"><i class="icon-plus"></i></a><a class="btn-mini"><i class="icon-remove"></i></a></div> <% } %>'),
        initialize: function(attributes) {
            this.value = attributes.value;
            this.many = attributes.many || false;
        },
        render: function() {
            var html = this.template({ options: this.model, value: this.value, many: this.many });
            this.setElement(html);
            this.$el.val(this.value ? this.value.eClass ? this.value.label() : this.value : null); // init select

            var view = this;
            this.$el.change(function() {
                var changed = $('option:selected', view.$el).val();
                view.trigger('change', changed);
            });
            return this;
        }
    });

    var PropertyRowView = Ecore.Editor.PropertyRowView = Backbone.View.extend({
        propertyTemplate: _.template('<tr><td><%= name %></td></tr>'),
        valueTemplate: _.template('<td></td>'),

        initialize: function() {
            this.eFeature = this.model.eFeature;
            this.eFeatureName = this.model.eFeatureName || this.eFeature.get('name');
            this.value = this.model.value;
            this.eType = this.eFeature ? this.eFeature.get('eType') : null;
        },

        render: function() {
            var eFeature = this.eFeature,
                eFeatureName = this.eFeatureName,
                eType = this.eType,
                model = this.model.eObject,
                value = this.value || model.get(eFeatureName),
                html = this.propertyTemplate({ name: eFeatureName }),
                valueView;

            this.setElement(html);

            if (!eFeature) {
                valueView = new SelectView({ model: [value], value: value, many: false });
                valueView.on('change', function(changed) {
                    console.log(changed);
                });
            } else {

            if (eFeature.get('upperBound') !== 1) {
                valueView = new SelectView({
                    model: eFeature.get('derived') ? value : value.array(),
                    value: value,
                    many: true
                });
            } else {
                if (eFeature.isTypeOf('EAttribute')) {
                    if (eType === Ecore.EBoolean) {
                        valueView = new SelectView({ model: ['true', 'false'], value: value });
                        valueView.on('change', function(changed) {
                            model.set(eFeatureName, changed);
                            model.trigger('change');
                            model.eResource().trigger('change', model);
                        });
                    } else {
                        valueView = new TextView({ model: value });
                        valueView.on('change', function(changed) {
                            model.set(eFeatureName, changed);
                            model.trigger('change');
                            model.eResource().trigger('change', model);
                        });
                    }
                } else {
                    valueView = new SelectView({ model: value ? [value] : [], value: value });
                }
            }

            }

            if (valueView) {
                valueView.render();
                var td = $(document.createElement('td'));
                td.append(valueView.$el);
                this.$el.append(td);
            }

            return this;
        },

        remove: function() {
            this.$el.remove();

            return this;
        }

    });



    Ecore.Editor.Tabbable = Backbone.View.extend({
        el: '#edit-tabs',
        template: _.template('<div class="tabbable"><ul class="nav nav-tabs"></ul><div class="tab-content"></div></div>'),

        initialize: function() {
            this.tabs = [];
        },

        render: function() {
            this.remove();
            var html = this.template();
            this.$el.append(html);
            this.$tabs = $('ul', this.$el);
            this.$content = $('div[class*="tab-content"]', this.$el);

            _.each(this.tabs, function(tab) {
                tab.render();
            }, this);

            return this;
        },

        addTab: function(tab) {
            tab.parent = this;
            tab.on('close', this.close);
            this.tabs.push(tab);

            return this;
        },

        close: function(tab) {
            tab.remove();
            this.tabs = _.without(this.tabs, tab);

            return this;
        },

        remove: function() {
            this.$el.children().remove();

            return this;
        }
    });

    Ecore.Editor.Tab = Backbone.View.extend({
        templateContent: _.template('<div class="tab-pane" id="tab-<%= id %>"></div>'),

        events: {
        },

        intialize: function(attributes) {
            _.bindAll(this);
        },

        render: function() {
            var html = this.templateContent({ id: this.cid });
            this.setElement(html);
            this.parent.$content.append(this.$el);

            this.tab = new TabTab({ id: this.cid, label: this.model.label() });
            this.tab.on('close', function() {
                this.trigger('close', this);
            }, this);
            this.tab.render();

            this.$tab = this.tab.$el;
            this.parent.$tabs.append(this.$tab);

            var view = this;
            this.$tab.on('shown', function() {
                view.renderContent();
            });

            return this;
        },

        renderContent: function() { },

        show: function() {
            this.$tab.show();
        },

        remove: function() {
            this.$tab.remove();
            this.tab.off();
            delete this.tab;
            this.$el.remove();
        }
    });

    var TabTab = Backbone.View.extend({
        template: _.template('<li><a href="#tab-<%= id %>" data-toggle="tab"> <%= label %> <i class="icon-remove-circle"></i> </a></li>'),

        events: {
            'click': 'show',
            'click i[class*="icon-remove"]': 'close'
        },

        initialize: function(attributes) {
            this._id = attributes.id;
            this.label = attributes.label;
        },

        render: function() {
            this.remove();
            var html = this.template({ id: this._id, label: this.label });
            this.setElement(html);

            return this;
        },

        close: function() {
            this.trigger('close', this);
        },

        show: function() {
            this.$el.tab('show');
        },

        remove: function() {

        }

    });



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



    var TreeView = Ecore.Editor.TreeView = Backbone.View.extend({
        template: _.template('<div class="tree"></div>'),

        initialize: function(attributes) {
            _.bindAll(this, 'render', 'remove');
            this.properties = attributes.properties;
            this.el = attributes.el;

            this.on('select', function(view) {
                if (this.currentSelection && this.currentSelection !== view) {
                    this.currentSelection.deselect();
                }
                this.currentSelection = view;
            }, this);
        },

        render: function() {
            this.remove();
            this.views = [];

            var html = this.template();
            _.each(_.isArray(this.model) ? this.model : [this.model], function(e) {
                var view = new TreeNodeView({ model: e, tree: this });
                this.views.push(view);
            }, this);

            this.setElement(html);

            return this;
        },

        show: function() {
            _.each(this.views, function(v) {
                v.render();
                this.$el.append(v.$el);
            }, this);
            return this;
        },

        remove: function() {
            this.$el.children().remove();
            return this;
        }

    });

    var TreeNodeView = Ecore.Editor.TreeNodeView = Backbone.View.extend({
        template: _.template('<ul class="tree-node <% if ( root ) { %> tree-root <% } %>"></ul>'),
        innerTemplate: _.template('<li><div><span class="icon-chevron-right"></span><span class="state"><span class="icon-tree-<%= eClass %> folder"></span><%= name %></span></div></li>'),
        initialize: function(attributes) {
            _.bindAll(this, 'render', 'expand', 'select', 'innerRender');
            this.expanded = false;
            this.tree = attributes.tree;
        },

        expand: function() {
            var contents = this.model.eContents();
            if (_.isEmpty(contents)) return this;

            if (this.expanded) {
                this.$el.children().remove();
                this.innerRender();
                this.expanded = false;
            } else {
                _.each(contents, function(e) {
                    var view = new TreeNodeView({ model: e, tree: this.tree });
                    view.render();
                    this.$el.append(view.$el);
                }, this);

                this.expanded = true;
            }

            return this;
        },

        render: function() {
            var eContainer = this.model.eContainer;
            var html = this.template({root: eContainer ? eContainer.isTypeOf('Resource') : true });
            this.setElement(html);

            return this.innerRender();
        },

        innerRender: function() {
            var html = this.innerTemplate({
                eClass: this.model.eClass.get('name'),
                name: this.model.label(),
                icon: this.model.eContents().length === 0 ? "-" : "+"
            });
            this.$el.append(html);

            var view = this;
            $('div > span[class*="icon-chevron-right"]', this.$el).click(function() { view.expand(); });

            if (!this.properties && Ecore.Editor.PropertyView) {
                 this.properties = new Ecore.Editor.PropertyView({ model: this.model });
             }

            $('div', this.$el).mouseover(function() {
                if (view.tree.currentSelection !== view)
                    $('div > span[class*="state"]:first', view.$el).addClass('tree-over');
            });

             $('div', this.$el).mouseout(function() {
                $('div > span[class*="state"]:first', view.$el).removeClass('tree-over');
            });

            $('div', this.$el).click(function() {
                view.select();
                if (view.properties) {
                    view.properties.remove();
                    view.properties.render();
                }
            });

            return this;
        },

        deselect: function() {
            $('div > span[class*="state"]:first', this.$el).removeClass('tree-selected');
            this.tree.trigger('deselect', this);

            return this;
        },

        select: function() {
            $('div > span[class*="state"]:first', this.$el).addClass('tree-selected');
            this.tree.trigger('select', this);

            return this;
        }

    });



})();
