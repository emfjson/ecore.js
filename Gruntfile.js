module.exports = function(grunt) {

    grunt.initConfig({

        concat: {
            dist: {
                src: [
                    'build/head.js',
                    'src/ecore.js',
                    'src/resource.js',
                    'src/edit.js',
                    'build/tail.js'
                ],
                dest: 'dist/ecore.js'
            },
            dist_xmi: {
                src: [
                    'build/head.js',
                    'src/ecore.js',
                    'src/resource.js',
                    'src/edit.js',
                    'src/xmi.js',
                    'build/tail.js'
                ],
                dest: 'dist/ecore.xmi.js'
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

        mochaTestConfig: {
            options: {
                globals: ['should'],
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'nyan'
            }
        },

        mochaTest: {
            files: ['test/*.test.js']
        },

        uglify: {
            dist: {
                files: {
                    'dist/ecore.min.js': ['dist/ecore.js']
                }
            },
            dist_xmi: {
                files: {
                    'dist/ecore.xmi.min.js': ['dist/ecore.xmi.js']
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('test', ['concat', 'mochaTest']);
    grunt.registerTask('build', ['concat', 'mochaTest', 'uglify']);

};
