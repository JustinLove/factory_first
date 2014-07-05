var spec = require('./lib/spec')
var prompt = require('prompt')
prompt.start()

var stream = 'stable'
var media = require('./lib/path').media(stream)
var build = 'ui/main/shared/js/build.js'
var base = 'pa/units/commanders/base_commander/base_commander.json'

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    copy: {
      build: {
        files: [
          {
            src: media + build,
            dest: build,
          },
        ],
      },
      base: {
        files: [
          {
            src: media + base,
            dest: base,
          },
        ],
      },
    },
    jsonlint: {
      all: {
        src: [
          'pa/ammo/**/*.json',
          'pa/tools/**/*.json',
          'pa/units/**/*.json'
        ]
      },
    },
    json_schema: {
      all: {
        files: {
          'lib/schema.json': [
            'pa/ammo/**/*.json',
            'pa/tools/**/*.json',
            'pa/units/**/*.json'
          ]
        },
      },
    },
    proc: {
      ff: {
        filename_regexp: 'base_commander',
        process: function(spec) {
          spec.production.energy = 1500
          spec.production.metal = 30
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-jsonlint');
  grunt.loadNpmTasks('grunt-json-schema');

  grunt.registerTask('copy:unitFiles', 'copy files into the mod from PA', function() {
    var done = this.async()
    prompt.get(['filename_regexp'], function(err,result) {
      var specs = spec.specFiles(grunt, result.filename_regexp, media)
      spec.copyUnitFiles(grunt, specs)
      done()
    })
  })

  var proc = function(filename_regexp, process) {
    var specs = spec.specFiles(grunt, filename_regexp)
    spec.copyUnitFiles(grunt, specs, process)
  }

  grunt.registerMultiTask('proc', 'Process unit files', function() {
    var process = this.data.process
    if (this.data.filename_regexp) {
      proc(this.data.filename_regexp, process)
    } else {
      var done = this.async()
      prompt.get(['filename_regexp'], function(err,result) {
        proc(result.filename_regexp, process)
        done()
      })
    }
  })

  grunt.registerTask('patch_67998', 'fixup specs for PTE changes', function() {
    var patch = require('./lib/patch_67998')
    patch.fixSpecs(grunt)
  })

  // Default task(s).
  grunt.registerTask('default', ['copy:base', 'proc:ff', 'json_schema', 'jsonlint']);

};

