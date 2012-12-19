
var PropertyWindow = Ecore.Editor.Window.extend({
    el: '#property-window',
    title: 'Property',
    draggable: true,
    content: new Ecore.Editor.PropertySheetView()
});

