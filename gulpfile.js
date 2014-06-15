var gulp = require('gulp'),

	// Server and sync
	browserSync = require('browser-sync'),

	// Other plugins
	sass = require('gulp-ruby-sass'),
	concat = require('gulp-concat'),
	rimraf = require('gulp-rimraf'),
	minify = require('gulp-minify-css'),
	htmlbuild = require('gulp-htmlbuild'),
	uglify = require('gulp-uglify'),
	imagemin = require('gulp-imagemin');



// Server initiation and livereload, opens server in browser
gulp.task('serve', function() {
	browserSync.init(null, {
		server: {
			baseDir: './prod'
		}
    });
});


// SASS compiling & reloading
gulp.task('sass', function () {
    gulp.src('./prod/sass/*.scss')
        .pipe(sass({
        	compass: true,
        	precision: 3,
        	noCache: true,
        	quiet: true
        }))
        .pipe(gulp.dest('./prod/css'))
        .pipe(browserSync.reload({
        	stream: true
        }));
});




// Clear 'dist' directory, then minifying, copying, processing, uglifying, etc for build
gulp.task('remove', function() {
	gulp.src('./dist/**/*', { read: false })
		.pipe(rimraf());
});
gulp.task('minify', function() {
	gulp.src('./prod/css/*.css')
		.pipe(minify({
			keepSpecialComments: 0
		}))
		.pipe(gulp.dest('./dist/css'));
});
gulp.task('scripts', function() {
	gulp.src('./prod/js/header/*.js')
		.pipe(concat('header.js'))
		.pipe(gulp.dest('./dist/js'));
});
gulp.task('html', function() {
	gulp.src("./prod/**/*.html")
		.pipe(htmlbuild({
			js: function (files, callback) {
	      		gulp.run('scripts');
	      		callback(null, [ '/js/header.js' ]);
	    	}
	  	}))
	  	.pipe(gulp.dest("./dist"));
});
gulp.task('uglify', function() {
  	gulp.src('./prod/js/*.js')
      	.pipe(uglify())
      	.pipe(gulp.dest('./dist/js'));

	gulp.src('./dist/js/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('./dist/js'));
});
gulp.task('imagemin', function () {
    gulp.src('./prod/img/**/*')
        .pipe(imagemin({
        	progressive: true
        }))
        .pipe(gulp.dest('./dist/img'));
});




// Watching files for changes before reloading
gulp.task('watch', function() {
	gulp.watch('./prod/sass/**/*.scss', ['sass']);

	gulp.watch('./prod/img/**/*', function() {
		gulp.src('./prod/img/**/*')
		    .pipe(browserSync.reload({
		    	stream: true
		    }));
	});

	gulp.watch('./prod/js/**/*.js', function() {
		gulp.src('./prod/**/*.js')
		    .pipe(browserSync.reload({
		    	stream: true,
		    	once: true
		    }));
	});

	gulp.watch('./prod/**/*.html', function() {
		browserSync.reload();
	});
});




// Default functionality includes server with browser sync and watching
gulp.task('default',
	['serve'],
	function(){
	gulp.start(
		'sass',
		'watch'
	);
});

// Build functionality with cleaning, moving, compiling, etc.
gulp.task('build',
	['remove'],
    function(){
	gulp.start(
		'sass',
		'minify',
		'html',
		'uglify',
		'imagemin'
	);
});
