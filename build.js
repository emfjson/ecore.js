require('shelljs/global');

cd(__dirname);

var res, content = '', mds = ['about.md', 'gettingStarted.md'];

cd('pages');
mds.forEach(function(file) {
    res = exec('pandoc -f markdown -t html ' + file, { silent: true });
    if (res.code !== 0) {
        echo('Error converting ', file, res.output);
    } else {
        content += res.output;
    }
});

cd('../templates');
var index = cat('header.html');
index += content;
index += cat('footer.html');

cd('..');
index.to('index.html');
