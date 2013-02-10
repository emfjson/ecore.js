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
                    'src/edit/ui/window/Window.js',
                    'src/edit/ui/menu/Menus.js',
                    'src/edit/ui/property/Value.js',
                    'src/edit/ui/property/Row.js',
                    'src/edit/ui/property/Property.js',
                    'src/edit/ui/tabs/Tab.js',
                    'src/edit/ui/tree/Node.js',
                    'src/edit/ui/tree/Tree.js',
                    'src/edit/ui/editor/Editor.js',
                    'src/edit/ui/tabs/TabPanel.js',
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
