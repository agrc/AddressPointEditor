module.exports = function(grunt) {
    var srcFiles = 'src/app/**/*.js';
    var gruntFile = 'GruntFile.js';
    var internFile = 'tests/intern.js';
    var packageFile = 'package.json';
    var jshintFiles = [srcFiles, gruntFile, internFile, packageFile];
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: jshintFiles,
            options: {
                jshintrc: '.jshintrc'
            }
        },
        watch: {
            jshint: {
                files: jshintFiles,
                tasks: ['jshint']
            },
            src: {
                files: [srcFiles],
                options: {
                    livereload: true
                }
            }
        },
        connect: {
            uses_defaults: {}
        },
        open: {
            intern: {
                path: 'http://localhost:8000/node_modules/intern-geezer/client.html?config=tests/intern'
            }
        },
        phantom: {
            options: {
                port: 4444
            },
            intern: {}
        },
        intern: {
            runner: {
                options: {
                    runType: 'runner',
                    config: 'tests/intern'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-phantom');
    grunt.loadNpmTasks('intern-geezer');

    grunt.registerTask('default', ['jshint', 'connect', 'open:intern', 'watch']);
    grunt.registerTask('phantomtest', ['phantom:intern', 'intern:runner']);
};
