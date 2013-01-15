module.exports = function(grunt) {
    grunt.initConfig({
        watch: {
            scripts: {
                files: '../src-demo/**/*.js',
                tasks: ['concat'],
                options: {
                    interrupt: true
                }
            }
        },

        concat: {
            dist: {
                src: [
                    'start.js',
                    '../src-demo/views/btn.nav.js',
                    '../src-demo/views/resourceset.nav.js',
                    '../src-demo/views/resource.nav.js',
                    '../src-demo/views/modals.js',
                    '../src-demo/views/property.js',
                    '../src-demo/views/editor.js',
                    '../src-demo/demo.dnd.js',
                    '../src-demo/demo.app.js',
                    'end.js'
                ],
                dest: '../demo/js/demo.app.js'
            }
        }
    });

    grunt.registerTask('build', 'concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
};
