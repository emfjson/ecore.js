module.exports = function(grunt) {

    grunt.initConfig({

        concat: {
            dist: {
                src: ['src/ecore.js', 'src/resource.js', 'src/xmi.js'],
                dest: 'dist/ecore.js'
            },
            edit: {
                src: [
                    'src/edit/ecore.edit.js',
                    'src/edit/windows.js',
                    'src/edit/menus.js',
                    'src/edit/explorer.js',
                    'src/edit/property.js',
                    'src/edit/tabs.js',
                    'src/edit/tabeditor.js',
                    'src/edit/tree.js',
                    'src/edit/ecore.edit.end.js'
                ],
                dest: 'dist/ecore.edit.js'
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
                src: 'test/*.test.js',
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
            },
            edit: {
                src: ['dist/ecore.edit.js'],
                dest: 'dist/ecore.edit.min.js'
            }
        }

    });

    grunt.loadNpmTasks('grunt-simple-mocha');

    grunt.registerTask('test', 'concat simplemocha');
    grunt.registerTask('build', 'concat simplemocha min');

};
