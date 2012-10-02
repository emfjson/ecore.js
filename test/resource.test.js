_ = require('../lib/underscore.js');
fs = require('fs');
var Ecore = require('../dist/ecore.js');
var assert = require("assert");

describe('Model', function() {

    describe('loading model from local filesystem', function() {

        it('should work', function(done) {

            var model = new Ecore.Model('simple.json');

            fs.readFile('./test/simple.json', 'utf8', function (err,data) {
              if (err) {
                return console.log(err);
              }

              model.load(function(model) {
                console.log(model);
                done();
              }, function(){}, data);
            });

        });
    });

});