
var PropertyWindow = Ecore.Edit.Window.extend({
    el: '#property-window',
    title: 'Property',
    draggable: true,
    content: new Ecore.Edit.PropertySheetView()
});

