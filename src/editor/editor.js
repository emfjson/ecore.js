$(function(){

    var currentModel;

    $('#confirm-create-model').click(function(){
        var modelName = $('#inputName').val();
        var model = new Ecore.Model({ name: modelName });

        currentModel = model;

        $('#create-model-modal').modal('hide');




        $('.editor').append(row);
    });

    function createEPackage(parent) {
        console.log(parent);
        if (parent instanceof Ecore.Model) {
          var ePackage = new Ecore.EPackage({ name: 'EPackage' });
          parent.contents.push( ePackage );
        };
    };

    function createDropDown(model) {
        var dropdown = document.createElement('div');
        dropdown.setAttribute('class', 'btn-group');

        var dropdownToggle = document.createElement('a');
        dropdownToggle.setAttribute('class', 'btn dropdown-toggle');
        dropdownToggle.setAttribute('role', 'button');
        dropdownToggle.setAttribute('data-toggle', 'dropdown');
        dropdownToggle.setAttribute('href', '#');
        dropdownToggle.innerHTML = '- resource: ' + modelName + ' ';

        var caret = document.createElement('span');
        caret.setAttribute('class', 'caret');

        dropdownToggle.appendChild(caret);
        dropdown.appendChild(dropdownToggle);

        var dropdownContent = document.createElement('ul');
        dropdownContent.setAttribute('class', 'dropdown-menu');
        dropdownContent.setAttribute('role', 'menu');

        var dropdownContent1 = document.createElement('li');

        var action = document.createElement('a');
        action.innerHTML = 'New EPackage';
        action.addEventListener('click', function(evt) {
            createEPackage(model);
        });

        dropdownContent1.appendChild( action );
        dropdownContent.appendChild( dropdownContent1 );

        dropdown.appendChild( dropdownContent );

        var row = document.createElement('div');
        row.setAttribute('class', 'row-fluid');

        row.appendChild( dropdown );

        return row;
    };

    function addAction(node, model) {

    };

});