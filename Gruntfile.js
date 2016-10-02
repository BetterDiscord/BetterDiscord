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
            options: {
                screwIE8: true
            },
            js: {
                files: {
                    'js/main.min.js': ['js/main.js']
                }
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
    grunt.registerTask('default', ['sass', 'concat', 'uglify', 'cssmin']);
};