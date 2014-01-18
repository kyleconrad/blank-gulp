var gulp = require('gulp'),

	// Server plugins
	refresh = require('gulp-livereload'),
	lrserver = require('tiny-lr')(),
	express = require('express'),
	livereload = require('connect-livereload'),

	// Other plugins
	open = require('gulp-open'),
	sass = require('gulp-ruby-sass'),

	// Server settings
	lrport = 35729,
	serverport = 5000;


// Server configuration with livereload enabled
var server = express();
server.use(livereload({
	port: lrport
}));
server.use(express.static('./prod'));



// Server initiation and livereload, opens server in browser
gulp.task('serve', function() {
	server.listen(serverport);
	lrserver.listen(lrport);

	gulp.src('./prod/index.html')
	    .pipe(open('', {
	    	url: 'http://localhost:' + serverport
	    }));
});



// SASS compiling & reloading
gulp.task('sass', function () {
    gulp.src('./prod/sass/*.scss')
        .pipe(sass({
        	compass: true,
        	noCache: true,
        	quiet: true
        }))
        .pipe(gulp.dest('./prod/css'))
        .pipe(refresh(lrserver));
});




// Watching files for changes before reloading
gulp.task('watch', function() {
	gulp.watch('./prod/sass/*.scss', function() {
		gulp.run('sass');
	});
	gulp.watch('./prod/js/**/*.js', function() {
		gulp.src('./prod/js/**/*.js')
		    .pipe(refresh(lrserver));
	});
	gulp.watch('./prod/**/*.html', function() {
		gulp.src('./prod/**/*.html')
		    .pipe(refresh(lrserver));
	});
});


// Default functionality includes server with livereload and watching
gulp.task('default', function(){
	gulp.run(
		'sass',
		'serve',
		'watch'
	);
});

// Build functionality with moving, compiling, etc.
//gulp.task('build', function(){
//	gulp.run(
//
//	);
//});