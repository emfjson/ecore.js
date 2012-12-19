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

    render: function() {
        var html = this.template();
        this.views = [];

        this.$el.append(html);
        this.$content = $('.nav-content', this.$el);
        this.$header = $('.nav-header > div', this.$el);

        _.each(this.buttons, this.addButton, this);
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

    createResource: function() {
        var res = this.model.create({ uri: 'http://www.example.org/sample' });
        var view = new ResourceView({ model: res });
    },

    addButton: function(icon) {
        var btn = new ButtonView({ icon: icon });
        btn.click = this.actions[icon];
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




var PropertyWindow = Ecore.Editor.Window.extend({
    el: '#property-window',
    title: 'Property',
    draggable: true,
    content: new Ecore.Editor.PropertySheetView()
});




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




Ecore.LabelProvider = {
    getLabel: function(eObject) {
        return this[eObject.eClass.get('name')](eObject);
    },

    EClass: function(eObject) { return eObject.get('name'); },
    EPackage: function(eObject) { return eObject.get('name'); },
    ResourceSet: function(eObject) { return 'resourceSet'; },
    Resource: function(eObject) { return eObject.get('uri'); }
};

// ResourceSet
//

var resourceSet = Ecore.ResourceSet.create();
var EcoreResource = resourceSet.create({ uri: Ecore.EcorePackage.get('nsURI') });
var ResourceResource = resourceSet.create({ uri: 'http://www.eclipselabs.org/ecore/2012/resources' });

resourceSet.label = function() {
    return 'resourceSet';
};

ResourceResource.label = EcoreResource.label = function() {
    return this.get('uri');
};

Workbench.properties = new PropertyWindow();
Workbench.editorTab = new DemoEditorTabView();
Workbench.navigator = new ResourceNavigatorView({ model: resourceSet });

Workbench.navigator.render();

Workbench.navigator.on('select', function(e) {
    this.editorTab.render().open(e);
    this.properties.content.model = e;
    this.properties.render();
}, Workbench);

Workbench.editorTab.on('select', function(m) {
    this.properties.content.model = m;
    this.properties.render();
}, Workbench);



});

