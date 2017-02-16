var gulp = require('gulp'),

	// Server and sync
	browserSync = require('browser-sync').create(),

	// Other plugins
	rimraf = require('rimraf'),
	es = require('event-stream'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	cleanCSS = require('gulp-clean-css'),
	uglify = require('gulp-uglify'),
	imagemin = require('gulp-imagemin');



// =================================================================================== //



// Server initiation, BrowserSync, and watch tasks (opens site in browser)
gulp.task('default', ['sass'], function() {
    browserSync.init(null, {
		server: {
			baseDir: './prod'
		},
		host: 'localhost'
    });

	gulp.watch('./prod/sass/**/*.scss', ['sass']);
    gulp.watch('./prod/**/*.html').on('change', browserSync.reload);
    gulp.watch('./prod/img/**/*').on('change', browserSync.reload);
    gulp.watch('./prod/js/**/*.js').on('change', browserSync.reload);
});


// Run SASS compiling and reloading
gulp.task('sass', function() {
    return gulp.src('./prod/sass/*.scss')
	    .pipe(sourcemaps.init())
        .pipe(sass({
        	errLogToConsole: true
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./prod/css'))
        .pipe(browserSync.stream());
});



// =================================================================================== //



// Clear 'dist' directory, then minifying, copying, processing, uglifying, etc for build
gulp.task('remove', function (cb) {
    rimraf('./dist', cb);
});

gulp.task('minify', ['sass'], function() {
	return gulp.src('./prod/css/*.css')
		.pipe(cleanCSS({
			compatibility: '*'
		}))
		.pipe(gulp.dest('./dist/css'));
});

gulp.task('html', function() {
	return es.merge(
		gulp.src('./prod/**/*.html')
	  		.pipe(gulp.dest('./dist')),
	  	gulp.src('./prod/**/*.txt')
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


// Build functionality with cleaning, moving, compiling, etc.
gulp.task('build', ['remove'], function(){
	return gulp.start(
		'minify',
		'html',
		'scripts',
		'images'
	);
});
