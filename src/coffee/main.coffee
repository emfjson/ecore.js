
resourceSet = new ecore.ResourceSet

resourceSet.load 'http://127.0.0.1:5984/library/books', (resource) ->
    console.log resource
    document.writeln resource.content.name
    document.writeln( item.title for item in resource.content.items )
