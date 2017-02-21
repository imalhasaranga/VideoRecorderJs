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
            options: {
                sourceMap: false
            },
            build: {
                files: {
                    'dist/VideoRecorderJS.min.js': ['src/VideoRecorderJS.js',  'src/recorder.js']
                }
            }
            // ,
            // whammymin :{
            //     files: {
            //         'dist/whammy.min.js': ['src/whammy.js',  'src/recorder.js']
            //     }
            // }
        },
        copy: {
            main: {
                files: [

                    //'src/whammy.js',
                    //{ expand: true, flatten: true, src: 'src/whammy.js', dest: 'dist/', filter: 'isFile' },
                    { expand: true, flatten: true, src: 'src/recorderWorker.js', dest: 'dist/', filter: 'isFile' }
                ]
            }
        },
        concat: {
            options: {
                separator: ';',
            },
            dist: {
                src: ['dist/VideoRecorderJS.min.js', 'src/whammy.js'],
                dest: 'dist/VideoRecorderJS.min.js',
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');

    //grunt.registerTask('default', ['jshint', 'uglify', 'copy']);
    grunt.registerTask('default', ['uglify', 'copy' , 'concat']);

};