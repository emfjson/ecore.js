window.onload = function() {

    var sourceCodes = document.querySelectorAll('code.sourceCode');
    console.log(sourceCodes);

    for (var i = 0, l = sourceCodes.length; i < l; i++) {
        sourceCodes[i].setAttribute('data-language', 'javascript');
    }

//    Rainbow.color();
//    console.log(Rainbow);
};
