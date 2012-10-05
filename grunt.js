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

        },

        min: {
            dist: {
                src: ['dist/ecore.js'],
                dest: 'dist/ecore.min.js'
            }
        }

    });

    grunt.loadNpmTasks('grunt-simple-mocha');

    grunt.registerTask('test', 'concat simplemocha');
    grunt.registerTask('build', 'concat simplemocha min');

};
