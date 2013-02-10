(function() {



//
// Ecore.Edit
//

var Edit = Ecore.Edit = {
    version: '0.3.0'
};

//
// LabelProvider
//
// Provides labels for EObjects.
//
// It can be extended to provide labels to different kind of EObject by
// using the extend method provided by underscore:
//
//      _.extend(Ecore.Edit.LabelProvider, {
//          FooClass: function(eObject) { return eObject.get('bar'); }
//      });
//

Edit.LabelProvider = {
    getLabel: function(eObject) {
        var eClass = eObject.eClass.get('name');
        if (this[eClass])
            return this[eClass](eObject);
        else
            return eObject.eClass.get('name');
    },

    // Labels for Ecore classes

    EClass: function(eObject) { return eObject.get('name'); },
    EDataType: function(eObject) { return eObject.get('name'); },
    EEnum: function(eObject) { return eObject.get('name'); },
    EEnumLiteral: function(eObject) { return eObject.get('name') + ' = ' + eObject.get('value'); },
    EAttribute: function(eObject) {
        var type = eObject.isSet('eType') ? ' : ' + eObject.get('eType').get('name') : '';
        return eObject.get('name') + type;
    },
    EReference: function(eObject) {
        var type = eObject.isSet('eType') ? ' : ' + eObject.get('eType').get('name') : '';
        return eObject.get('name') + type;
    },
    EOperation: function(eObject) {
        var returnType = eObject.isSet('eType') ? ' : ' + eObject.get('eType').get('name') : '';
        return eObject.get('name') + '()' + returnType;
    },
    EPackage: function(eObject) { return eObject.get('name'); },
    ResourceSet: function(eObject) { return 'resourceSet'; },
    Resource: function(eObject) { return eObject.get('uri'); }
};



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

Edit.Window = Backbone.View.extend({
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
        this.$el.css('z-index', '1000');
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

        resizable(this, this.$el[0]);

        return this;
    },

    remove: function() {
        if (this.$content) {
            this.$content.remove();
        }
        if (this.$el) {
            this.$el.children().remove();
            this.$el.css('z-index', '-1');
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

Edit.SimpleWindow = Edit.Window.extend({
    header: _.template('<div></div>'),
    initialize: function(attributes) {
        this.title = attributes.title || 'Window';
        this.height = attributes.height;
        this.draggable = attributes.draggable;
        this.content = attributes.content;
    }
});



Edit.MenuBar = Backbone.View.extend({
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

Edit.MenuBarButton = Backbone.View.extend({
    template: _.template('<a class="btn btn-<%= size %>"> <%= label %> </a>'),

    events: {
        'click': 'click'
    },

    initialize: function(attributes) {
        _.bindAll(this, 'render', 'click');
        this.size = attributes.size || 'mini';
        this.label = attributes.label;
    },
    render: function() {
        var html = this.template({ label: this.label, size: this.size });
        this.setElement(html);

        return this;
    },
    click: function(e) {
        this.trigger('click', e);
    }
});

Edit.MenuBarDropDownButton = Edit.MenuBarButton.extend({
    template: _.template('<a class="btn btn-<%= size %>" data-toggle="dropdown"> <%= label %> <span class="caret"> </span></a><ul class="dropdown-menu"></ul>'),

    initialize: function(attributes) {
        Edit.MenuBarButton.prototype.initialize.apply(this, [attributes]);

        this.label = attributes.label;
        this.items = attributes.items || [];
    },
    render: function() {
        Edit.MenuBarButton.prototype.render.apply(this);

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

Edit.Separator = Backbone.View.extend({
    template: _.template('<li class="divider"></li>'),

    render: function() {
        var html = this.template();
        this.setElement(html);
        return this;
    }
});

Edit.DropDownItem = Backbone.View.extend({
    template: _.template('<li><a tabindex="-1" href="#"><%= label %></a></li>'),

    events: {
        'click a': 'click'
    },

    initialize: function(attributes) {
        _.bindAll(this, 'render', 'click');
        this.label = attributes.label;
    },
    render: function() {
        var html = this.template({ label: this.label });
        this.setElement(html);

        return this;
    },
    click: function(e) {
        this.trigger('click', e);
    },
    remove: function() {
        Backbone.View.prototype.remove.apply(this);
    }
});



var TextValue = Backbone.View.extend({
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

var DateValue = Backbone.View.extend({});

var SelectValue = Backbone.View.extend({
    templateOptions: _.template('<% _.each(options, function(option) { %> <option> <%= option.eClass ? Ecore.Edit.LabelProvider.getLabel(option) : option %></option> <% }); %>'),

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
            var val = this.value ? this.value.eClass ? Edit.LabelProvider.getLabel(this.value) : this.value : null;
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

var SingleValueSelect = SelectValue.extend({
    template: _.template('<select></select>'),

    initialize: function(attributes) {
        SelectValue.prototype.initialize.apply(this, [attributes]);
    },

    render: function() {
        var html = this.template();
        this.setElement(html);
        SelectValue.prototype.render.apply(this);
        return this;
    }
});

var MultiValueSelect = SelectValue.extend({
    template: _.template('<select multiple="multiple"></select>'),
    templateActions: _.template('<div class="btn-group"></div>'),
    templateAddAction: _.template('<a class="btn-mini"><i class="icon-plus"></i></a>'),
    templateDelAction: _.template('<a class="btn-mini"><i class="icon-remove"></i></a>'),

    initialize: function(attributes) {
        SelectValue.prototype.initialize.apply(this, [attributes]);
    },

    render: function() {
        var html = this.template();
        this.setElement(html);

        SelectValue.prototype.render.apply(this);

        var div = $(document.createElement('div'));
        div.append(this.$el);
        this.setElement(div);

        return this;
    }
});



Edit.PropertyRow = Backbone.View.extend({
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
                this.options = getElements(this.model.eObject, this.eFeature);
            }
        }
    },

    renderEAttribute: function(model, eFeature, value) {
        var view;

        if (eFeature.get('many')) {

        } else {
            if (eFeature.get('eType') === Ecore.EBoolean)
                view = this.renderEAttributeBoolean(model, eFeature, value || false);
            else {
                view = new TextValue({ model: value });
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
        var view = new SingleValueSelect({
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
            view = new MultiValueSelect({
                value: value,
                options: this.options
            });
        } else {
            view = new SingleValueSelect({
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
            view = new SingleValueSelect({
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


function getElements(eObject, eFeature) {
    var options = [];
    var value = eObject.get(eFeature);

    if (value) {
        var type = value.eClass;
        var resourceSet = eObject.eResource().get('resourceSet');
        var elements = resourceSet.elements();
        options = _.filter(elements, function(e) {
            return e.eClass === type; // || _.contains(e.eClass.get('eAllSuperTypes'), type);
        });
    }

    return options;
}



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

Edit.PropertySheet = Backbone.View.extend({
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
            new Edit.PropertyRow({
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



Edit.Tab = Backbone.View.extend({
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
            var title = this.title();
            var html = this.template({ id: this.eid, title: title });
            this.setElement(html);
            this._rendered = true;
        }
        return this;
    },
    remove: function() {
        this.trigger('remove');
        return Backbone.View.prototype.remove.apply(this);
    },
    title: function() {
        var uri = this.model.get('uri');
        return uri.slice(uri.lastIndexOf('/') + 1, uri.length);
    }
});


/**
 * @name TreeNode
 * @class
 *
 */
Edit.TreeNode = Backbone.View.extend(/** @lends TreeNode.prototype */ {
    template: _.template('<tr class="tree-item-tr"></tr>'),
    table: '<table style="border-collapse; collapse; margin-left: 0px;"><tbody><tr></tr></tbody></table>',
    td: '<td class="tree-td"></td>',

    events: {
        'mouseover': 'highlight',
        'mouseout': 'unhighlight'
    },

    initialize: function(attributes) {
        this.tree = attributes.tree;
        this.parent = attributes.parent;
        this.margin = attributes.margin;
        this.children = [];
        _.bindAll(this, 'render', 'onClick', 'expand', 'collapse', 'highlight', 'unhighlight');
    },
    render: function() {
        var html = this.template();
        this.remove();
        this.setElement(html);

        if (this.model) {
            this.$el.append(this._createLabelElemnt());
        } else {
            this.$el.append(this._createAddElement());
        }

        return this;
    },
    highlight: function() {
        this.$el[0].style.background = 'rgba(255, 255, 102, 0.6)';
        this.$el[0].style.cursor = 'pointer';
    },
    unhighlight: function() {
        this.$el[0].style.background = 'rgba(255, 255, 255, 1)';
        this.$el[0].style.cursor = 'auto';
    },
    onClick: function() {
        this.tree.setSelection(this);
        if (this.expanded) {
            this.collapse();
        } else {
            this.expand();
        }
    },
    select: function(e) {
        if (e) e.stopImmediatePropagation();
        if (this.$el) {
            this.$el.addClass('tree-selected');
        }
        this.tree.setSelection(this);
    },
    deselect: function() {
        if (this.$el) {
            this.$el.removeClass('tree-selected');
        }
    },
    expand: function() {
        this.expanded = true;
        var contents = this.model.eContents();
        _.each(contents, this.addNode, this);
    },
    addNode: function(model) {
        var previous = _.last(this.children);
        var view = new Edit.TreeNode({
            model: model,
            tree: this.tree,
            parent: this,
            margin: this.margin + 24
        });

        if (previous) previous.next = view;

        this.children.push(view);
        view.render();

        if (this.next && this.next !== this) {
            this.tree.$tbody[0].insertBefore(view.$el[0], this.next.$el[0]);
        } else {
            this.tree.$tbody.append(view.$el);
        }
    },
    collapse: function() {
        this.expanded = false;
        _.each(this.children, function(c) { c.remove(); });
        this.children.length = 0;
    },
    remove: function() {
        _.each(this.children, function(c) { c.remove(); });
        Backbone.View.prototype.remove.apply(this);
        this.children.length = 0;
        return this;
    },


    // private methods


    _createAddElement: function() {
        var td = document.createElement('td');
        td.className = 'tree-td';
        var add = document.createElement('a');
        add.className = 'icon-plus icon-large';
        td.appendChild(add);
        return td;
    },
    _createOrderElement: function() {
        var td = document.createElement('td');
        td.className = 'tree-td';
        if (this.parent) {
            var reorder = document.createElement('a');
            reorder.className += ' icon-reorder icon-large';
            reorder.style.color = 'grey';
            td.appendChild(reorder);
        }
        return td;
    },
    _createLabelElemnt: function() {
        var td = document.createElement('td');
        td.className = 'tree-td';
        var table = this._createInnerTable();
        td.appendChild(table.table);

        var label = Edit.LabelProvider.getLabel(this.model);
        table.label.innerHTML = label;
        td.addEventListener('click', this.onClick);

        return td;
    },
    _createEditElement: function() {
        var td = document.createElement('td');
        td.style.background = '#F5F5F5';
        td.style.color = '#CCCCCC';
        td.style.padding = 0;
        var copy = document.createElement('div');
        copy.className = 'icon-edit icon-large';
        td.appendChild(copy);
        return td;
    },
    _createDeleteElement: function() {
        var td = document.createElement('td');
        td.style.background = '#F5F5F5';
        td.style.color = '#CCCCCC';
        td.style.padding = 0;
        var del = document.createElement('div');
        del.className = 'icon-remove icon-large';
        td.appendChild(del);

        return td;
    },
    _createInnerTable: function() {
        var table = document.createElement('table');
        table.style.marginLeft = this.margin + 'px';
        table.style.borderCollapse = 'collapse';
        var tbody = document.createElement('tbody');
        var tr = document.createElement('tr');
        var td_btn = document.createElement('td');
        td_btn.className = 'tree-td';
        var btn = document.createElement('a');
        btn.className = 'icon-caret-right';
        btn.style.color = 'grey';
        btn.style.cursor = 'pointer';
        var td_label = document.createElement('td');
        td_label.className = 'tree-td';
        var div_label = document.createElement('div');
        div_label.className = 'tree-label';
        var td_icon = document.createElement('td');
        td_icon.className = 'tree-td';
        var span_icon = document.createElement('span');
        span_icon.className = 'icon-edit-' + this.model.eClass.get('name');

        td_btn.appendChild(btn);
        tr.appendChild(td_btn);
        tr.appendChild(td_icon);
        td_icon.appendChild(span_icon);
        td_label.appendChild(div_label);
        tr.appendChild(td_label);
        tbody.appendChild(tr);
        table.appendChild(tbody);

        return { table: table, label: div_label };
    }

});

/*

 TreeNodeView

<li>
    <div class="tree-node">
        <div class="tree-selected">
            <span class="icon-chevron-right"></span>
            <span class="icon-edit-EPackage folder"></span>
            <span> 222 </span>
        </div>
        <ul>
        </ul>
    </div>
</li>



Edit.TreeNodeView = Backbone.View.extend({
    template: _.template('<li><div class="<%= kind %>"><div></div><ul></ul></div></li>'),
    chevronTemplate: _.template('<span class="chevron icon-chevron-right"></span>'),
    iconTemplate: _.template('<span class="icon-edit-<%= icon %>"> </span>'),
    labelTemplate: _.template('<span> <%= label %> </span>'),

    isSelected: false,
    isExpanded: false,

    events: {
        'click div span[class~="chevron"]': 'expand',
        'click': 'select',
        'mouseover': 'highlight',
        'mouseout': 'unhighlight'
    },

    initialize: function(attributes) {
        _.bindAll(this, 'render', 'expand', 'select', 'highlight', 'unhighlight');
        this.children = [];
        this.tree = attributes.tree;
    },
    kind: function() {
        var contents = this.model ? this.model.eContents() : [];
        return contents.length > 0 ? 'tree-node' : 'tree-leaf';
    },
    render: function() {
        if (!this.model) return this;

        var kind = this.kind();
        if (!this.$node) {
            var html = this.template({ kind: kind });
            this.setElement(html);

            this.$node = $('div > div', this.$el);
            this.$children = $('div > ul', this.$el);
        }

        // clear content
        this.$node.children().remove();
        this.$children.children().remove();

        // make content
        var icon = this.model.eClass.get('name');
        var label = Edit.LabelProvider.getLabel(this.model);
        var chevronHTML = this.chevronTemplate();
        var iconHTML = this.iconTemplate({ icon: icon });
        var labelHTML = this.labelTemplate({ label: label });

        if (kind === 'tree-node') {
            this.$node.append(chevronHTML);
        }

        this.$node.append(iconHTML) .append(labelHTML);
        this.$chevron = $('span[class~="chevron"]', this.$node);

        return this;
    },
    highlight: function(eve) {
        if (eve) eve.stopImmediatePropagation();
        if (this.$el && this.$node) {
            this.$node.addClass('tree-over');
        }
    },
    unhighlight: function(eve) {
        if (eve) eve.stopImmediatePropagation();
        if (this.$el && this.$node) {
            this.$node.removeClass('tree-over');
        }
    },
    select: function(eve) {
        if (eve) eve.stopImmediatePropagation();
        if (this.$el && this.$node) {
            this.$node.addClass('tree-selected');
        }
        this.tree.setSelection(this);
    },
    deselect: function() {
        if (this.$el && this.$node) {
            this.$node.removeClass('tree-selected');
        }
    },
    addChildren: function(child) {
        if (!child) return;
        var view = new Edit.TreeNodeView({ model: child, tree: this.tree });
        view.render();
        this.$children.append(view.$el);
        this.children.push(view);
        return view;
    },
    expand: function(eve) {
        if (eve) eve.stopImmediatePropagation();
        if (!this.$children) return this;

        if (this.isExpanded) {
            this.$children.children().remove();
            this.$chevron
                .removeClass('icon-chevron-down')
                .addClass('icon-chevron-right');
            this.children.length = 0;
            this.isExpanded = false;
        } else {
            var contents = this.model.eContents();
            if (contents.length === 0) return this;

            this.$chevron
                .removeClass('icon-chevron-right')
                .addClass('icon-chevron-down');
            this.$children.children().remove();
            this.children.length = 0;
            _.each(contents, this.addChildren, this);
            this.isExpanded = true;
        }

        return this;
    }
});

*/


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


/**
 * @name TabPanel
 * @class
 */
Edit.TabPanel = Backbone.View.extend(/** @lends TabPanel.prototype */ {
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
    add: function(editor) {
        if (this.$content && this.$tabs) {
            editor.$container = this.$content;
            editor.$tabs = this.$tabs;
            this.editors.push(editor);

            editor.on('remove', function() { this.suppress(editor); }, this);
        }
    },
    get: function(editor) {
        return _.find(this.editors, function(e) { return e === editor; });
    },
    getByModel: function(model) {
        return _.find(this.editors, function(e) { return e.model === model; });
    },
    suppress: function(editor) {
        this.editors = _.without(this.editors, editor);
    },
    show: function(model) {
        this.getByModel(model).show();
    },
    open: function(model) {
        var editor = this.getByModel(model);
        if (!editor) {
            editor = new Edit.TabEditor({ model: model });
            this.add(editor);
            editor.render();
        }
        editor.show();
    }
});



})();
