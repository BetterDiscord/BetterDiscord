module.exports = grunt => {
    'use strict';
    
    require('load-grunt-tasks')(grunt);
    
    grunt.initConfig({
        requirejs: {
            compileProject: {
                options: {
                    include: ['src/js/core'],
                    out: 'intermediate/requirejs.js',
                    optimize: 'none'
                }
            }
        },
        babel: {
            dist: {
                files: [{
                    src: ['intermediate/requirejs.js'],
                    dest: 'intermediate/babel.js'
                }]
            }
        },
        replace: {
            dist: {
                options: {
                    patterns: [{
                        match: /\\n +/g,
                        replacement: ''
                    },{
                        match: /  +/g,
                        replacement: ' '
                    },{
                        match: /\/*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g,
                        replacement: ''
                    }]
                },
                files: [{
                    expand: true, src: ['intermediate/babel.js'], dest: ''
                }]
            },
            nongreedy: {
                options: {
                    patterns: [{
                        match: /\\n +/g,
                        replacement: ''
                    },{
                        match: /  +/g,
                        replacement: ' '
                    },{
                        match: /\/\*(.|[\r\n])*?\*\//g,
                        replacement: ''
                    }]
                },
                files: [{
                    expand: true, src: ['intermediate/babel.js'], dest: ''
                }]
            }
        },
        amdclean: {
            options: {
                wrap: {
                    start: '(function() {\n\n    "use strict";\n\n    var electron = require("electron");\n',
                    end: '\n\n}());'
                },
                escodegen: {
                    format: {
                        indent: {
                            style: '    ',
                            base: 1
                        }
                    }
                },
                aggressiveOptimizations: true,
                transformAMDChecks: false
            },
            dist: {
                src: 'intermediate/babel.js',
                dest: 'dist/js/main.js'
            }
            
        },
        clean: [
            'intermediate'
        ]
    });
    
    grunt.registerTask("js", [ "requirejs", "babel", "replace", "amdclean", "clean" ]);
    grunt.registerTask("js-noclean", [ "requirejs", "babel", "replace", "amdclean" ]);
    
    grunt.registerTask("fastjs", ["requirejs", "babel", "replace:nongreedy", "amdclean", "clean" ]);
    grunt.registerTask("fastjs-noclean", ["requirejs", "babel", "replace:nongreedy", "amdclean" ]);
    
    
};