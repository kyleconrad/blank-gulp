var gulp = require('gulp'),

	// Server and sync
	browserSync = require('browser-sync'),

	// Other plugins
	rimraf = require('rimraf'),
	es = require('event-stream'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	minify = require('gulp-minify-css'),
	uglify = require('gulp-uglify'),
	imagemin = require('gulp-imagemin');



// Server initiation and livereload, opens server in browser
gulp.task('serve', function() {
	browserSync.init(null, {
		server: {
			baseDir: './prod'
		},
		host: 'localhost'
    });
});


// SASS compiling & reloading
gulp.task('sass', function() {
    gulp.src('./prod/sass/*.scss')
	    .pipe(sourcemaps.init())
        .pipe(sass({
        	errLogToConsole: true
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./prod/css'))
        .pipe(browserSync.reload({
        	stream: true
        }));
});


// Clear 'dist' directory, then minifying, copying, processing, uglifying, etc for build
gulp.task('remove', function (cb) {
    rimraf('./dist', cb);
});

gulp.task('minify', ['sass'], function() {
	return gulp.src('./prod/css/*.css')
		.pipe(minify({
			keepSpecialComments: 0
		}))
		.pipe(gulp.dest('./dist/css'));
});

gulp.task('html', function() {
	return es.merge(
		gulp.src("./prod/**/*.html")
	  		.pipe(gulp.dest('./dist')),
	  	gulp.src("./prod/**/*.txt")
	  		.pipe(gulp.dest('./dist'))
	);
});

gulp.task('scripts', function() {
  	return gulp.src('./prod/js/*.js')
      	.pipe(uglify())
      	.pipe(gulp.dest('./dist/js'));
});

gulp.task('images', function() {
	return es.merge(
		gulp.src('./prod/img/**/*')
	        .pipe(imagemin({
	        	progressive: true,
	        	svgoPlugins: [{
	        		removeViewBox: false
	        	},
	        	{
	        		cleanupIDs: false
	        	},
	        	{
	        		collapseGroups: false
	        	},
	     		{
	     			convertShapeToPath: false
	     		}]
	        }))
	        .pipe(gulp.dest('./dist/img')),
		gulp.src(['./prod/*.png', './prod/*.jpg'])
	        .pipe(imagemin({
	        	progressive: true
	        }))
	        .pipe(gulp.dest('./dist')),
		gulp.src('./prod/*.ico')
			.pipe(gulp.dest('./dist'))
	);
});


// Watching files for changes before reloading
gulp.task('watch-img', function() {
	gulp.src('./prod/img/**/*')
	    .pipe(browserSync.reload({
	    	stream: true
	    }));
});

gulp.task('watch-js', function() {
	gulp.src('./prod/**/*.js')
	    .pipe(browserSync.reload({
	    	stream: true,
	    	once: true
	    }));
});

gulp.task('watch-html', function() {
	gulp.src('./prod/**/*.html')
	    .pipe(browserSync.reload({
	    	stream: true,
	    	once: true
	    }));
});




// Default functionality includes server with browser sync and watching
gulp.task('default', ['serve', 'sass'], function(){
	gulp.watch('./prod/sass/**/*.scss', ['sass']);
	gulp.watch('./prod/img/**/*', ['watch-img']);
	gulp.watch('./prod/js/**/*.js', ['watch-js']);
	gulp.watch('./prod/**/*.html', ['watch-html']);
});

// Build functionality with cleaning, moving, compiling, etc.
gulp.task('build', ['remove'], function(){
	return gulp.start(
		'minify',
		'html',
		'scripts',
		'images'
	);
});
