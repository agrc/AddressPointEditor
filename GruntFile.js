/* jshint camelcase:false */
module.exports = function(grunt) {
    var jsFiles = 'src/app/**/*.js',
        otherFiles = [
            'src/app/**/*.html',
            'src/app/**/*.css',
            'src/index.html',
            'src/ChangeLog.html'
        ],
        gruntFile = 'GruntFile.js',
        jshintFiles = [jsFiles, gruntFile],
        bumpFiles = [
            'package.json',
            'src/app/package.json',
            'bower.json',
            'src/app/config.js'
        ],
        deployFiles = [
            '**',
            '!build-report.txt',
            '!util/**',
            '!jasmine-favicon-reporter/**',
            '!**/*.uncompressed.js',
            '!**/*consoleStripped.js',
            '!**/*.min.*',
            '!**/tests/**',
            '!**/bootstrap/test-infra/**',
            '!**/bootstrap/less/**'
        ],
        deployDirProd = 'AddressPointEditor',
        deployDirStage = 'wwwroot/AddressPointEditor',
        secrets;
    try {
        secrets = grunt.file.readJSON('secrets.json');
    } catch (e) {
        // swallow for build server
        secrets = {
            stageHost: '',
            prodHost: '',
            username: '',
            password: ''
        };
    }

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        amdcheck: {
            main: {
                options: {
                    removeUnusedDependencies: false
                },
                files: [{
                    src: [
                        'src/app/**/*.js'
                    ]
                }]
            }
        },
        bump: {
            options: {
                files: bumpFiles,
                commitFiles: bumpFiles.concat('src/ChangeLog.html'),
                push: false
            }
        },
        clean: {
            build: ['dist'],
            deploy: ['deploy']
        },
        compress: {
            main: {
                options: {
                    archive: 'deploy/deploy.zip'
                },
                files: [{
                    src: deployFiles,
                    dest: './',
                    cwd: 'dist/',
                    expand: true
                }]
            }
        },
        connect: {
            uses_mains: {}
        },
        copy: {
            main: {
                expand: true,
                cwd: 'src/',
                src: ['ChangeLog.html'],
                dest: 'dist/'
            }
        },
        dojo: {
            prod: {
                options: {
                    // You can also specify options to be used in all your tasks
                    profiles: ['profiles/prod.build.profile.js', 'profiles/build.profile.js'] // Profile for build
                }
            },
            stage: {
                options: {
                    // You can also specify options to be used in all your tasks
                    profiles: ['profiles/stage.build.profile.js', 'profiles/build.profile.js'] // Profile for build
                }
            },
            options: {
                // You can also specify options to be used in all your tasks
                dojo: 'src/dojo/dojo.js', // Path to dojo.js file in dojo source
                load: 'build', // Optional: Utility to bootstrap (Default: 'build')
                releaseDir: '../dist',
                require: 'src/app/run.js', // Optional: Module to require for the build (Default: nothing)
                basePath: './src'
            }
        },
        esri_slurp: {
            options: {
                version: '3.10'
            },
            dev: {
                options: {
                    beautify: true
                },
                dest: 'src/esri'
            },
            travis: {
                dest: 'src/esri'
            }
        },
        imagemin: {
            main: {
                options: {
                    optimizationLevel: 3
                },
                files: [{
                    expand: true, // Enable dynamic expansion
                    cwd: 'src/', // Src matches are relative to this path
                    src: '**/*.{png,jpg,gif}', // Actual patterns to match
                    dest: 'src/' // Destination path prefix
                }]
            }
        },
        jasmine: {
            main: {
                src: ['src/app/run.js'],
                options: {
                    specs: ['src/app/**/Spec*.js'],
                    vendor: [
                        'src/jasmine-favicon-reporter/vendor/favico.js',
                        'src/jasmine-favicon-reporter/jasmine-favicon-reporter.js',
                        'src/app/tests/jasmineTestBootstrap.js',
                        'src/dojo/dojo.js',
                        'src/app/tests/jasmineAMDErrorChecking.js'
                    ],
                    host: 'http://localhost:8000'
                }
            }
        },
        jshint: {
            files: jshintFiles,
            options: {
                jshintrc: '.jshintrc'
            }
        },
        processhtml: {
            options: {},
            main: {
                files: {
                    'dist/index.html': ['src/index.html'],
                    'dist/user_admin.html': ['src/user_admin.html']
                }
            }
        },
        secrets: secrets,
        sftp: {
            stage: {
                files: {
                    './': 'deploy/deploy.zip'
                },
                options: {
                    host: '<%= secrets.stageHost %>',
                    path: './' + deployDirStage + '/'
                }
            },
            prod: {
                files: {
                    './': 'deploy/deploy.zip'
                },
                options: {
                    host: '<%= secrets.prodHost %>',
                    path: './' + deployDirProd + '/'
                }
            },
            options: {
                srcBasePath: 'deploy/',
                username: '<%= secrets.username %>',
                password: '<%= secrets.password %>',
                showProgress: true
            }
        },
        sshexec: {
            options: {
                username: '<%= secrets.username %>',
                password: '<%= secrets.password %>'
            },
            stage: {
                command: ['cd ' + deployDirStage, 'unzip -oq deploy.zip', 'rm deploy.zip'].join(';'),
                options: {
                    host: '<%= secrets.stageHost %>'
                }
            },
            prod: {
                command: ['cd ' + deployDirProd, 'unzip -oq deploy.zip', 'rm deploy.zip'].join(';'),
                options: {
                    host: '<%= secrets.prodHost %>'
                }
            }
        },
        watch: {
            jshint: {
                files: jshintFiles,
                tasks: ['jshint', 'jasmine:main:build']
            },
            src: {
                files: jshintFiles.concat(otherFiles),
                options: {
                    livereload: true
                }
            }
        }
    });

    // Loading dependencies
    for (var key in grunt.file.readJSON('package.json').devDependencies) {
        if (key !== 'grunt' && key.indexOf('grunt') === 0) {
            grunt.loadNpmTasks(key);
        }
    }

    // Default task.
    grunt.registerTask('default', [
        'jshint',
        'amdcheck:main',
        'if-missing:esri_slurp:dev',
        'jasmine:main:build',
        'connect',
        'watch'
    ]);
    grunt.registerTask('build-prod', [
        'clean:build',
        'dojo:prod',
        'newer:imagemin:main',
        'copy:main',
        'processhtml:main'
    ]);
    grunt.registerTask('build-stage', [
        'clean:build',
        'dojo:stage',
        'newer:imagemin:main',
        'copy:main',
        'processhtml:main'
    ]);
    grunt.registerTask('deploy-prod', [
        'clean:deploy',
        'compress:main',
        'sftp:prod',
        'sshexec:prod'
    ]);
    grunt.registerTask('deploy-stage', [
        'clean:deploy',
        'compress:main',
        'sftp:stage',
        'sshexec:stage'
    ]);
    grunt.registerTask('travis', [
        'esri_slurp:travis',
        'jshint',
        'connect',
        'jasmine:main'
    ]);
};