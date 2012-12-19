

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

