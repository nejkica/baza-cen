var gulp = require('gulp'),
fs = require('fs'),
GulpSSH = require('gulp-ssh') ;


var config = {
  host: '192.168.112.200',
  port: 22,
  username: 'jernejj',
  password: 'Jernej!567',
  privateKey: fs.readFileSync('./gulp/tasks/id_rsa')
};

var gulpSSH = new GulpSSH({
  ignoreErrors: true,
  sshConfig: config
});


gulp.task('kopirajStreznik', function() {
	return gulp.src(['./gulp/server/**/*'])
	.pipe(gulpSSH.dest('/home/jernejj/RikoBazaCen'));
});