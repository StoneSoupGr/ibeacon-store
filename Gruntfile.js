/*jshint camelcase:false */

module.exports = function (grunt) {

  // load all grunt tasks
  // require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.loadNpmTasks('mantri');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-parallel');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  // Load local tasks
  // grunt.loadTasks('tasks');


  //
  //
  // Grunt related variables
  //

  // get the current environment.
  var environment = process.env.NODE_ENV || 'development';

  // Define the webserver port during development.
  var develPort = '3000';

  grunt.initConfig({
    mantriDeps: {
      target: {
        src: './front/static',
        dest: './front/static/deps.js',
        root: './front/static',
      }
    },
    mantriBuild: {
      options: {
        debug: false,
      },
      app: {
        src: 'front/static/mantriConf.json',
        dest: './front/static/app.min.js',
      }
    },
    express: {
      options: {
        // Override defaults here
      },
      web: {
        options: {
          script: 'back/app.js',
        }
      },
      api: {
        options: {
          script: 'back/api.js',
        }
      },
    },
    watch: {
      frontend: {
        options: {
          livereload: true
        },
        files: [
          // triggering livereload when the .css file is updated
          // (compared to triggering when sass completes)
          // allows livereload to not do a full page refresh
          'front/static/styles/*.css',
          'front/templates/**/*.jade',
          'front/static/scripts/**/*.js',
          'front/static/img/**/*'
        ]
      },
      stylesSass: {
        files: [
          'front/styles/**/*.scss'
        ],
        tasks: [
          'sass',
          'cssmin'
        ]
      },
      web: {
        files: [
          'backend/**/*.js',
          'config/*',
          'test/**/*.js',
        ],
        tasks: [
          'express:web'
        ],
        options: {
          nospawn: true, //Without this option specified express won't be reloaded
        }
      },
      api: {
        files: [
          'backend/**/*.js',
          'config/*',
        ],
        tasks: [
          'express:web',
        ],
        options: {
          nospawn: true, //Without this option specified express won't be reloaded
        }
      },
      apiTest: {
        files: ['test/**/*.js'],
        tasks: ['mochaTest:api'],
      }

    },
    connect: {},
    open: {
      server: {
        path: 'http://localhost:' + develPort
      }
    },

    clean: {},
    uglify: {},
    concat: {},
    imagemin: {},
    cssmin: {
      dist: {
        files: {
          'front/static/styles/main.css': [
            'front/static/components/jquery-ui/themes/base/minified/jquery-ui.min.css',
            'front/static/components/jquery-ui/themes/base/minified/jquery-ui.button.min.css',
            'front/static/components/jquery-ui/themes/base/minified/jquery-ui.dialog.min.css',
            'temp/main-sass.css',
          ]
        }
      }
    },
    sass: {
      options: {
      },
      dist: {
        files: [{
          'temp/main-sass.css': 'front/styles/boot.scss',


          // expand: true,
          // cwd: 'front/',
          // src: [
          //   'styles/*.scss',
          //   'components/sass-bootstrap/lib/*.scss',
          // ],
          // dest: '../static/styles',
          // ext: '.css',
        }]
      }
    },

    parallel: {
      web: {
        options: {
          stream: true
        },
        tasks: [{
          grunt: true,
          args: ['watch:frontend']
        }, {
          grunt: true,
          args: ['watch:stylesSass']
        }, {
          grunt: true,
          args: ['watch:web']
        }]
      },
      api: {
        options: {
          stream: true
        },
        tasks: [{
          grunt: true,
          args: ['watch:api']
        }, {
          grunt: true,
          args: ['watch:apiTest']
        }]
      }
    },

    //
    //
    // Testing
    //
    //
    mochaTest: {
      web: {
        options: {
          // only add the tests that pass
          // grep: /(\s1\.1|\s1\.2|\s1\.4|\s1\.6|\s0\.0|\s2\.0|\s1\.3|\s1\.5)/,
          // grep: /(\1\.3\.10\.1)/,
          //
          // Shell version:
          // mocha -b test/unit/ -u tdd  -R spec -g "1.1| 1.2| 1.4| 1.6| 0.0| 2.0| 1.3| 1.5"
          //
          ui: 'tdd',
          reporter: 'spec'
        },
        src: [ 'test/unit/*.js' ]
      },
      api: {
        options: {
          ui: 'bdd',
          reporter: 'spec'
        },
        src: [ 'test/api/*.js' ]
      },
    },

    shell: {
      deploy: {
        options: {
          stdout: true,
        },
        command: './deploy nko',
      }
    },



  }); // end grunt.initConfig();

  //
  //
  // Register tasks and aliases
  //
  //

  grunt.registerTask('stop', 'Kill all the servers (mongodb, reddis)', 'serversDown');
  grunt.registerTask('start', 'Start the required servers', 'serversUp');

  grunt.registerTask('test', [
    'start',
    'mochaTest:web',
    'mochaTest:api',
  ]);

  grunt.registerTask('css', 'SASS and combine minify', [
    'sass:dist',
    'cssmin:dist'
  ]);
  grunt.registerTask('api', 'api development, watches, runs tests', [
    'express:api',
    'parallel:api',
  ]);
  grunt.registerTask('deploy', 'Nodejitsu deploy ops', [
    'sass:dist',
    'mantriBuild:app',
    'shell:deploy',
  ]);

  grunt.registerTask('frontend', [
    'parallel:web',
  ]);

  grunt.registerTask('web', [
    'start',
    'initdb',
    'express:web',
    'open:server',
    'parallel:web',
  ]);
  grunt.registerTask('default', ['web']);

};
