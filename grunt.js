module.exports = function(grunt) {

    grunt.initConfig({

        concat: {
            dist: {
                src: ['src/ecore.js', 'src/resource.js'],
                dest: 'dist/ecore.js'
            }
        },

        lint: {
            all: ['grunt.js', 'dist/ecore.js', 'test/*.js']
        },

        jshint: {
            options: {
                browser: true
            }
        },

        simplemocha: {

            all: {
                src: 'test/*.js',
                options: {
                    globals: ['should'],
                    timeout: 3000,
                    ignoreLeaks: false,
                    ui: 'bdd',
                    reporter: 'min'
                }
            }

        }

    });

    grunt.loadNpmTasks('grunt-simple-mocha');

    grunt.registerTask('default', 'concat simplemocha');

};