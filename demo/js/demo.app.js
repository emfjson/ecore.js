jQuery(function() {

    window.Demo = {};

    var Workbench = Demo.Workbench = _.extend({}, Backbone.Events);




var ButtonView = Backbone.View.extend({
    template: _.template('<a id="<%= id %>" style="cursor: pointer"><i class="<%= icon %>"></i></a>'),
    events: {
        'click': 'click'
    },
    initialize: function(attributes) {
        _.bindAll(this, 'render', 'click');
        this.icon = attributes.icon;
    },
    render: function() {
        var html = this.template({ id: this.id, icon: this.icon });
        this.setElement(html);
        return this;
    },
    click: function() {}
});



var ResourceNavigatorView = Backbone.View.extend({
    template: _.template('<div class="nav-header"><div class="nav-header-content"></div></div><div class="nav-content"><span>resources</span></div>'),
    el: '#nav-side',

    buttons: ['icon-plus', 'icon-remove', 'icon-share'],
    actions: {
        'icon-plus': function(e) {
            $('#add-modal').modal('show');
        },
        'icon-remove': function() {},
        'icon-share': function() {}
    },

    initialize: function() {
        _.bindAll(this, 'render');

        this.views = [];
        this.modal = new CreateResourceModal({ model: this.model });
        this.model.on('change', this.render);
    },

    render: function() {
        if (!this.$content) {
            var html = this.template();
            this.$el.append(html);
            this.$content = $('.nav-content', this.$el);
            this.$header = $('.nav-header > div', this.$el);

            _.each(this.buttons, this.addButton, this);
        }
        this.$content.children().remove();
        this.model.get('resources').each(this.addResource, this);

        return this;
    },

    addResource: function(res) {
        var view = new ResourceView({ model: res });
        view.render();
        this.views.push(view);
        this.$content.append(view.$el);
        view.on('select', function() { this.trigger('select', view.model); }, this);
        return this;
    },

    addButton: function(icon) {
        var btn = new ButtonView({ icon: icon });
        var modal = this.modal;
        btn.click = function(e) {
            modal.render();
            modal.show();
        };
        btn.render();
        this.$header.append(btn.$el);
        return this;
    }
});



var ResourceView = Backbone.View.extend({
    template: _.template('<div class="row-fluid nav-row"><a href="#"><i class="icon-edit-resource"></i><%= uri %></a></div>'),

    events: {
        'click': 'click'
    },

    initialize: function() {
        _.bindAll(this, 'render', 'click');
    },
    render: function() {
        var html = this.template({ uri: this.model.get('uri') });
        this.setElement(html);
        return this;
    },
    click: function() {
        this.trigger('select', this.model);
    }
});




var ModalView = Backbone.View.extend({
    template: _.template('<div id="<%= id =>" class="modal hide fade"></div>'),
    templateHeader: _.template('<div class="modal-header"></div>'),
    templateBody: _.template('<div class="modal-body"></div>'),
    templateFooter: _.template('<div class="modal-footer"><a href="#" class="btn">Close</a><a href="#" class="btn confirm">Confirm</a></div>'),

    render: function() {
        var html = this.template({ id: this.cid });
        var header = this.templateHeader();
        var body = this.templateBody();
        var footer = this.templateFooter();

        this.setElement(html);
        this.$el.append(header);
        this.$el.append(body);
        this.$el.append(footer);

        this.$header = $('div[class="modal-header"]', this.$el);
        this.$body = $('div[class="modal-body"]', this.$el);
        this.$footer = $('div[class="modal-footer"]', this.$el);

        return this;
    },

    show: function() {
        this.$el.modal('show');
    }

});

var CreateResourceModal = ModalView.extend({
    templateForm: _.template('<form class="form-horizontal"></form>'),
    templateControlURI: _.template('<div class="control-group"><label class="control-label" for="inputURI">URI</label><div class="controls"><input type="text" id="inputURI" placeholder="URI"></div></div>'),
    templateControlElement: _.template('<div class="control-group"><label class="control-label" for="inputElement">Element</label><div class="controls"><select type="text" id="selectElement"></select></div>'),
    templateHeaderContent: _.template('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h3>Create Resource</h3></div>'),
    templateOptions: _.template('<% _.each(options, function(option) { %> <option><%= option.get("name") %></option> <% }); %>'),

    events: {
        'click .modal-footer a[class~="confirm"]': 'onConfirm'
    },

    initialize: function() {
        _.bindAll(this, 'onConfirm');
    },

    render: function() {
        ModalView.prototype.render.apply(this);

        var html = this.templateForm();
        var header = this.templateHeaderContent();
        var cURI = this.templateControlURI();
        var cElt = this.templateControlElement();

        this.$header.append(header);
        this.$body.append(html);
        this.$form = $('form', this.$body);
        this.$form.append(cURI).append(cElt);

        this.$select = $('#selectElement', this.$form);
        console.log(this.model);
        this.classes = this.model.elements('EClass');
        this.classes = _.filter(this.classes, function(c) { return !c.get('abstract'); });

        var options = this.templateOptions({ options: this.classes });
        this.$select.append(options);

        return this;
    },

    createResource: function(uri, eClass) {
        var res = this.model.create({ uri: uri });
        res.get('contents').add(eClass.create());
        this.model.trigger('change add', res);
    },

    onConfirm: function() {
        var uri = $('#inputURI', this.$form).val();
        var element = $('option:selected', this.$select).val();

        if (uri && uri.length && element) {
            var eClass = _.find(this.classes, function(c) { return c.get('name') === element; } );
            if (eClass) this.createResource(uri, eClass);
        }

        this.$el.modal('hide');
    }

});



var PropertyWindow = Ecore.Edit.Window.extend({
    el: '#property-window',
    title: 'Property',
    draggable: true,
    content: new Ecore.Edit.PropertySheetView()
});



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


//
// dnd
//

function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();

    var startByte = e.target.getAttribute('data-startbyte');
    var endByte = e.target.getAttribute('data-endbyte');

    var files = e.dataTransfer.files;
    var file = files[0];
    var reader = new FileReader();

    reader.onloadend = function(e) {
        if (e.target.readyState == FileReader.DONE) {
            var data = e.target.result;
            var res = resourceSet.create({ uri: file.name  });
            res.parse(data, Ecore.XMI);
            resourceSet.trigger('change');
        }
    };

    var blob = file.slice(0, file.size);
    reader.readAsBinaryString(blob);
}

function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

var dropzone = $('#nav-side')[0];
dropzone.addEventListener('dragover', handleDragOver, false);
dropzone.addEventListener('drop', handleFileSelect, false);



// ResourceSet
//

var resourceSet = Ecore.ResourceSet.create();
var EcoreResource = resourceSet.create({ uri: Ecore.EcorePackage.get('nsURI') });
var ResourceResource = resourceSet.create({ uri: 'http://www.eclipselabs.org/ecore/2012/resources' });

Workbench.properties = new PropertyWindow();
Workbench.editorTab = new DemoEditorTabView();
Workbench.navigator = new ResourceNavigatorView({ model: resourceSet });

Workbench.navigator.render();

Workbench.navigator.on('select', function(m) {
    this.editorTab.render().open(m);
    this.properties.content.model = m;
    this.properties.render();
}, Workbench);

Workbench.editorTab.on('select', function(m) {
    this.properties.content.model = m;
    this.properties.render();
}, Workbench);

resourceSet.on('add', function(m) {
    this.editorTab.render().open(m);
    this.properties.content.model = m;
    this.properties.render();
}, Workbench);



});

