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
gulp.task('sass', function() {
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
	gulp.src('./dist/**/*', {
			read: false
		})
		.pipe(rimraf());
});

gulp.task('minify', ['sass'], function() {
	return gulp.src('./prod/css/*.css')
		.pipe(minify({
			keepSpecialComments: 0
		}))
		.pipe(gulp.dest('./dist/css'));
});

gulp.task('html', ['minify'], function() {
	return gulp.src("./prod/**/*.html")
		.pipe(htmlbuild({
			js: htmlbuild.preprocess.js(function (block) {
	      		gulp.src('./prod/js/header/*.js')
					.pipe(concat('header.js'))
					.pipe(gulp.dest('./prod/js'));
	      		block.end('/js/header.js');
	    	})
	  	}))
	  	.pipe(gulp.dest('./dist'));
});

gulp.task('uglify', ['html'], function() {
  	return gulp.src('./prod/js/*.js')
      	.pipe(uglify())
      	.pipe(gulp.dest('./dist/js'));
});

gulp.task('imagemin', ['uglify'], function() {
    return gulp.src('./prod/img/**/*')
        .pipe(imagemin({
        	progressive: true,
        	svgoPlugins: [{
        		removeViewBox: false
        	}]
        }))
        .pipe(gulp.dest('./dist/img'));
});

gulp.task('cleanup', ['imagemin'], function() {
    return gulp.src('./prod/js/header.js', {
			read: false
		})
		.pipe(rimraf());
})


// Watching files for changes before reloading
gulp.task('watch-img', function() {
	gulp.watch('./prod/img/**/*', function() {
		gulp.src('./prod/img/**/*')
		    .pipe(browserSync.reload({
		    	stream: true
		    }));
	});
});

gulp.task('watch-js', function() {
	gulp.watch('./prod/js/**/*.js', function() {
		gulp.src('./prod/**/*.js')
		    .pipe(browserSync.reload({
		    	stream: true,
		    	once: true
		    }));
	});
});

gulp.task('watch-html', function() {
	gulp.watch('./prod/**/*.html', function() {
		//browserSync.reload();
		gulp.src('./prod/**/*.html')
		    .pipe(browserSync.reload({
		    	stream: true,
		    	once: true
		    }));
	});
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
	    'sass',
	    'minify',
		'html',
		'uglify',
		'imagemin',
		'cleanup'
	);
});
