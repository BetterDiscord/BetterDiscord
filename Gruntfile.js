module.exports = function(grunt) {
    
    grunt.initConfig({
        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                files: {
                    'dev/css/main.css': 'dev/css/main.sass'
                }
            }
        },
        concat: {
            js: {
                src: 'dev/js/*.js',
                dest: 'js/main.js'
            },
            css: {
                src: 'dev/css/*.css',
                dest: 'css/main.css'
            }
        },
        uglify: {
            js: {
                src: 'js/main.js',
                dest: 'js/main.min.js'
            }
        },
        cssmin: {
            css: {
                src: 'css/main.css',
                dest: 'css/main.min.css'
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-css');
    grunt.registerTask('default', ['concat', 'uglify', 'sass', 'cssmin']);
};