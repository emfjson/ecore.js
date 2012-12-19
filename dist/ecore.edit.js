(function() {

    Ecore.Editor = {};

    var label = function() {
        var label = this.has('name') ? this.get('name') : this.get('uri');
        return this.eClass.get('name') + label ? ' ' + label : '';
    };

    var eClassLabel = function() {
        var supers = [];
        if (this.isSet('eSuperTypes')) {
            supers = this.get('eSuperTypes').map(function(s) { return s.get('name'); });
        }
        return this.get('name') + (supers.length ? ' > ' + supers.join(' , ') : '');
    };

    Ecore.EObject.get('eOperations').add(
        Ecore.EOperation.create({
            name: 'label',
            eType: Ecore.EString,
            upperBound: 1,
            lowerBound: 0,
            _: label
        }));

    Ecore.EClass.get('eOperations').add(
        Ecore.EOperation.create({
            name: 'label',
            eType: Ecore.EString,
            _: eClassLabel
        }));

    Ecore.EStructuralFeature.get('eOperations').add(
        Ecore.EOperation.create({
            name: 'label',
            eType: Ecore.EString,
            _: function() {
                return this.get('name') + ' : ' + this.get('eType').get('name');
            }
        }));

    _.each(Ecore.EPackage.Registry.ePackages(), function(p) {
        p.label = label;
        p.get('eClassifiers').each(function(c) {
            c.label = eClassLabel;

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

    title: 'Window',
    draggable: true,

    initialize: function(attributes) {
        _.bindAll(this, 'render', 'remove', 'close', 'minimize', 'maximize');
        if (!attributes) attributes = {};
        this.parts = attributes.parts;
        if (attributes.title && !this.title) {
            this.title = attributes.title;
        }
        if (attributes.height) {
            this.height = attributes.height;
        }
        if (attributes.draggable) {
            this.draggable = attributes.draggable;
        }
        if (attributes.content) {
            this.content = attributes.content;
        }
    },

    render: function() {
        this.remove();

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
            this.content.setElement(this.$content);
            this.content.render();
        }

        if (this.draggable) {
            draggable( this.$el.get()[0] );
        }

//        this.$el.css('top', '200px');
//        this.$el.css('left', '200px');

        resizable(this, this.$el[0]);

        return this;
    },

    remove: function() {
        if (this.$content) {
            this.$content.remove();
        }
        if (this.$el) {
//            this.$el[0].style.left = 0;
//            this.$el[0].style.top = 0;
            this.$el.children().remove();
        }
        return this;
    },

    close: function() {
        this.remove();
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

// PropertySheetView
//

Ecore.Editor.PropertySheetView = Backbone.View.extend({
    template: _.template('<table class="table table-striped"></table>'),
    templateTableHead: _.template('<thead><tr><th style="width: 30%"></th><th style="width: 70%"></th></tr></thead>'),
    templateTableBody: _.template('<tbody></tbody>'),

    initialize: function(attributes) {
        this.views = [];
    },

    remove: function() {
        if (this.$el) {
            this.$el.children().remove();
            _.each(this.views, function(v) { v.remove(); });
            this.views.length = 0;
        }
        return this;
    },

    render: function() {
        if (!this.model || !this.model.eClass) return;
        this.remove();

        var html = this.template(),
            htmlHead = this.templateTableHead(),
            htmlBody = this.templateTableBody();

        this.$el.append(html);

        $('table', this.$el)
            .append(htmlHead)
            .append(htmlBody);

        this.tbody = $('table > tbody', this.$el);

        return this.renderContent();
    },

    createRow: function(feature, model, value, options) {
        var view =
            new PropertyRowView({
                model: {
                    eFeature: feature,
                    eObject: model,
                    value: value,
                    options: options
                }
            });
        this.views.push(view);
    },

    createFeatureRow: function(f) {
        return this.createRow(f, this.model);
    },

    renderRow: function(r) {
        r.render();
        this.tbody.append(r.$el);
    },

    renderContent: function() {
        var eClass = this.model.eClass,
            attrs = _.filter(eClass.get('eAllAttributes'), function(f) { return !f.get('derived'); }),
            refs = _.filter(eClass.get('eAllReferences'), function(f) { return !f.get('derived'); }),
            resourceSet, eClasses;

        resourceSet = this.model.eResource().get('resourceSet');
        if (resourceSet) eClasses = resourceSet.elements('EClass');

        this.createRow('eClass', this.model, this.model.eClass, eClasses);
        _.each(attrs, this.createFeatureRow, this);
        _.each(refs, this.createFeatureRow, this);
        _.each(this.views, this.renderRow, this);

        return this;
    }
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
    templateOptions: _.template('<% _.each(options, function(option) { %> <option> <%= option.eClass ? option.label() : option %></option> <% }); %>'),

    initialize: function(attributes) {
        this.value = attributes.value;
        this.options = attributes.options;
    },

    render: function() {
        var html = this.templateOptions({ options: this.options });
        this.$el.append(html);

        if (this.value === true || this.value === false) {
            this.$el.val(''+this.value);
        } else {
            var val = this.value ? this.value.eClass ? this.value.label() : this.value : null;
            this.$el.val(val);
        }

        var view = this;
        this.$el.change(function() {
            var changed = $('option:selected', view.$el).val();
            view.trigger('change', changed);
        });

        return this;
    }
});

var SingleValueSelectView = SelectView.extend({
    template: _.template('<select></select>'),

    initialize: function(attributes) {
        SelectView.prototype.initialize.apply(this, [attributes]);
    },

    render: function() {
        var html = this.template();
        this.setElement(html);
        SelectView.prototype.render.apply(this);
        return this;
    }
});

var MultiValueSelectView = SelectView.extend({
    template: _.template('<select multiple="multiple"></select>'),
    templateActions: _.template('<div class="btn-group"></div>'),
    templateAddAction: _.template('<a class="btn-mini"><i class="icon-plus"></i></a>'),
    templateDelAction: _.template('<a class="btn-mini"><i class="icon-remove"></i></a>'),

    initialize: function(attributes) {
        SelectView.prototype.initialize.apply(this, [attributes]);
    },

    render: function() {
        var html = this.template();
        this.setElement(html);

        SelectView.prototype.render.apply(this);

        var div = $(document.createElement('div'));
        div.append(this.$el);
        this.setElement(div);

        return this;
    }
});

var PropertyRowView = Ecore.Editor.PropertyRowView = Backbone.View.extend({
    propertyTemplate: _.template('<tr><td><%= name %></td></tr>'),
    valueTemplate: _.template('<td></td>'),

    initialize: function(attributes) {
        _.bindAll(this, 'renderEReference', 'renderEAttribute', 'renderEAttributeBoolean', 'render');

        if (_.isObject(this.model.eFeature)) {
            this.eFeature = this.model.eFeature;
            this.eFeatureName = this.eFeature.get('name');
            this.eType = this.eFeature.get('eType');
        } else {
            this.eFeatureName = this.model.eFeature;
        }

        this.value = this.model.value;

        if (this.model.options) {
            this.options = this.model.options;
        } else {
            if (this.eFeature.get('upperBound') !== 1) {
                this.options = this.model.eObject.get(this.eFeatureName).array();
            } else {
                this.options = this.model.eObject.get(this.eFeatureName);
            }
        }
    },

    renderEAttribute: function(model, eFeature, value) {
        var view;

        if (eFeature.get('many')) {

        } else {
            if (eFeature.get('eType') === Ecore.EBoolean)
                view = this.renderEAttributeBoolean(model, eFeature, value);
            else {
                view = new TextView({ model: value });
                view.on('change', function(changed) {
                    model.set(eFeature.get('name'), changed);
                    model.trigger('change');
                    model.eResource().trigger('change', model);
                });
            }
        }

        return view;
    },

    renderEAttributeBoolean: function(model, eFeature, value) {
        var view = new SingleValueSelectView({
            options: ['true', 'false'],
            value: value
        });

        view.on('change', function(changed) {
            model.set(eFeature.get('name'), changed);
            model.trigger('change');
            model.eResource().trigger('change', model);
        });

        return view;
    },

    renderEReference: function(model, eFeature, value) {
        var view;
        if (eFeature.get('upperBound') !== 1) {
            view = new MultiValueSelectView({
                value: value,
                options: this.options
            });
        } else {
            view = new SingleValueSelectView({
                value: value,
                options: this.options
            });
        }

        return view;
    },

    render: function() {
        var model = this.model.eObject,
            value = this.value || model.get(this.eFeatureName),
            html = this.propertyTemplate({ name: this.eFeatureName }),
            view;

        this.setElement(html);

        if (this.eFeature) {
            if (this.eFeature.isTypeOf('EAttribute')) {
                view = this.renderEAttribute(model, this.eFeature, value);
            } else {
                view = this.renderEReference(model, this.eFeature, value);
            }
        } else {
            view = new SingleValueSelectView({
                model: [value],
                value: value,
                options: this.options
            });
            view.on('change', function(changed) {
                console.log(changed);
            });
        }

        if (view) {
            view.render();
            var td = $(document.createElement('td'));
            td.append(view.$el);
            this.$el.append(td);
        }

        return this;
    },

    remove: function() {
        this.$el.remove();

        return this;
    }

});



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

        if (this.model) {
            _(this.model.eContents()).each(function(e) {
                var view = new TreeNodeView({ model: e, tree: this });
                this.views.push(view);
            }, this);
        }

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
    innerTemplate: _.template('<li><div><span class="icon-chevron-right"></span><span class="state"><span class="icon-edit-<%= eClass %> folder"></span><%= name %></span></div></li>'),

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
            if (view.tree.currentSelection !== view) {
                $('div > span[class*="state"]:first', view.$el).addClass('tree-over');
            }
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
