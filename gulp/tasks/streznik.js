var gulp = require('gulp');
var exec = require('child_process').exec;

gulp.task('streznik', function (cb) {
  exec('node gulp\\server\\server.js', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});