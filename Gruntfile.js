module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['src/**/*.js'],
            options: {
                globals: {
                    jQuery: true
                }
            }
        },
        uglify: {
            build: {
                files: {
                    'dist/VideoRecorderJS.min.js': ['src/VideoRecorderJS.js', 'src/whammy.js', 'src/recorder.js']
                }
            }
        },
        copy: {
            main: {
                files: [
                    { expand: true, flatten: true, src: 'src/recorderWorker.js', dest: 'build/', filter: 'isFile' }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['jshint', 'uglify', 'copy']);

};