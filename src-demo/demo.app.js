
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

