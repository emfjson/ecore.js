module.exports = function(grunt) {

    grunt.initConfig({

        watch: {
            scripts: {
                files: [ 'src/**.js', 'test/*.js' ],
                tasks: [ 'test' ],
                options: {
                    spawn: false,
                },
            },
        },

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

        jshint: {
            beforeconcat: [ 'src/*.js' ],
            afterconcat: [ 'dist/ecore.js', 'dist/ecore.xmi.js' ],
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true
            }
        },

        mochaTest: {
            files: ['test/*.test.js'],
            options: {
                globals: ['should'],
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'nyan'
            }
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
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('test', ['concat', 'mochaTest']);
    grunt.registerTask('build', ['concat', 'mochaTest', 'uglify']);

};
