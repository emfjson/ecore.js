function main() {

    var selectModel = document.getElementById('select-model');
    var loadButton = document.getElementById('load-model');
    var textArea = document.getElementById('output');

    var resourceSet = Ecore.ResourceSet.create({ uri: '/api/models' });

    resourceSet.on('change', function() {
        selectModel.innerHTML = '';

        resourceSet.get('resources').each(function(resource) {
            var option = document.createElement('option');
            option.innerHTML = resource.get('uri');
            selectModel.appendChild(option);
        });

    });

    loadButton.addEventListener('click', function(e) {
        var resourceURI = selectModel.options[selectModel.selectedIndex].value;
        var resource = resourceSet.create({ uri: resourceURI });
        var display = function() {
            textArea.innerHTML = JSON.stringify(resource.to(Ecore.JSON), 0, 4);
        };

        resource.on('change', display);
        resource.load();
    });

    resourceSet.fetch();
};


window.onload = main;
