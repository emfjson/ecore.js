module.exports = function(grunt) {

    grunt.initConfig({

        concat: {
            dist: {
                src: ['src/ecore.js', 'src/resource.js', 'src/xmi.js'],
                dest: 'dist/ecore.js'
            },
            edit: {
                src: [
                    'src/edit/ecore.edit.start',
                    'src/edit/ecore.edit.js',
                    'src/edit/ui/window/windows.js',
                    'src/edit/ui/menu/menus.js',
                    'src/edit/ui/property/value.js',
                    'src/edit/ui/property/row.js',
                    'src/edit/ui/property/property.js',
                    'src/edit/ui/editor/tab.js',
                    'src/edit/ui/editor/editor.js',
                    'src/edit/ui/editor/tabeditor.js',
                    'src/edit/ui/tree/node.js',
                    'src/edit/ui/tree/tree.js',
                    'src/edit/ecore.edit.end'
                ],
                dest: 'dist/ecore.edit.js'
            }
        },

        less: {
            development: {
                options: {
                    compress: true
                },
                files: { 'dist/css/ecore.edit.css': 'src/edit/ui/**/*.less' }
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
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.registerTask('test', 'concat simplemocha');
    grunt.registerTask('build', 'concat simplemocha less min');

};
