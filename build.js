var fs = require('fs');
var exec = require('child_process').exec;
var output = '';
var mds = ['about.md', 'gettingStarted.md'];

exec('cat templates/header.html', function(err, stdout, stderr) {
    output += stdout;
    if (err) {
        console.log('Error concatinating header');
    } else {
        convertAll(mds, '', function(err, content) {
            if (err) {
                console.log(err);
            } else {
                output += content;
                exec('cat templates/footer.html', function(err, stdout, stderr) {
                    output += stdout;
                    fs.writeFile('index.html', output);
                });
            }
        });
    }
});

function convertAll(markdowns, content, callback) {
    if (markdowns.length === 0) {
        callback(null, content);
    } else {
        convertToHtml(markdowns[0], function(err, stdout) {
            if (err) {
                callback(err, null);
            } else {
                convertAll(markdowns.slice(1), content += stdout, callback);
            }
        });
    }
}

function convertToHtml(markdown, callback) {
    exec('pandoc -f markdown -t html pages/' + markdown, { silent: true }, function(err, stdout, stderr) {
        if (err) {
            console.log('Error converting', markdown);
            callback(err, null);
        } else {
            callback(null, stdout);
        }
    });
}

