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

