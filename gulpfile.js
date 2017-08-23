require('events').EventEmitter.prototype._maxListeners = 100;



var gulp = require('gulp'),

	// Server & BrowserSync
	browserSync = require('browser-sync').create(),

	// Required for development
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	fileinclude = require('gulp-file-include'),
	rename = require('gulp-rename'),

	// Required for build
	rimraf = require('rimraf'),
	del = require('del'),
	cleanCSS = require('gulp-clean-css'),
	revise = require('gulp-revise'),
	revReplace = require('gulp-rev-replace'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	gzip = require('gulp-gzip'),
	usemin = require('gulp-usemin'),
	inject = require('gulp-inject'),
	imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    sitemap = require('gulp-sitemap');





// =================================================================================== //
// Development
// =================================================================================== //


// Server initiation, BrowserSync, and watch tasks (opens site in browser)
gulp.task('default', ['html-build', 'sass'], function() {
    browserSync.init(null, {
		server: {
			baseDir: './dev'
		},
		host: 'localhost'
    });

	gulp.watch('./dev/**/*.html', ['html-watch']);
    gulp.watch('./dev/sass/**/*.scss', ['sass']);
    gulp.watch('./dev/js/**/*.js').on('change', browserSync.reload);
    gulp.watch('./dev/images/**/*').on('change', browserSync.reload);
});


// Compile all HTML from templates and includes
gulp.task('html-build', function() {
	return gulp.src('./dev/templates/*.tpl.html')
		.pipe(fileinclude({
			prefix: '@@',
			basepath: './dev/templates/'
		}))
		.pipe(rename({
 			extname: ''
		 }))
 		.pipe(rename({
 			extname: '.html'
 		}))
		.pipe(gulp.dest('./dev'));
});


// Ensure HTML is compiled before reloading browsers
gulp.task('html-watch', ['html-build'], function(done) {
	browserSync.reload();

	done();
});


// Run SASS compiling and reloading
gulp.task('sass', function() {
    return gulp.src('./dev/sass/*.scss')
	    .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dev/css'))
        .pipe(browserSync.stream());
});





// =================================================================================== //
// Build
// =================================================================================== //


// Clear build directory
gulp.task('remove', function(cb) {
    return rimraf('./build', cb);
});


// Minify CSS
gulp.task('minify', ['sass'], function() {
	return gulp.src('./dev/css/*.css')
		.pipe(cleanCSS({
			compatibility: '*'
		}))
		.pipe(gulp.dest('./build/css'))
		.pipe(revise())
		.pipe(revise.write())
		.pipe(gulp.dest('./build/css'))
});


// Concat and uglify JavaScript
gulp.task('scripts', function() {
	gulp.src('./dev/js/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('./build/js'))
		.pipe(revise())
		.pipe(revise.write())
		.pipe(gulp.dest('./build/js'));

	gulp.src('./dev/js/lib/*.js')
		.pipe(concat({
			path: 'header.js',
			cwd: ''
		}))
		.pipe(uglify({
			mangle: false
		}))
		.pipe(gulp.dest('./build/js'))
		.pipe(revise())
		.pipe(revise.write())
		.pipe(gulp.dest('./build/js'));
});


// Gzip CSS and JavaScript
gulp.task('gzip', ['scripts', 'minify'], function() {
	gulp.src('./build/js/*.js')
		.pipe(gzip())
        .pipe(gulp.dest('./build/js'));

    gulp.src('./build/css/*.css')
    	.pipe(gzip())
    	.pipe(gulp.dest('./build/css'));
});


// Merge revisions into revision file
gulp.task('merge', ['gzip'], function() {
	return gulp.src('./build/**/*.rev')
		.pipe(revise.merge('build'))
		.pipe(gulp.dest('./build'))
});


// Build HTML files, use revision file, generate sitemap
gulp.task('html', ['merge'], function(cb) {
	var manifest = gulp.src('./build/rev-manifest.json');

	return Promise.all([
		new Promise(function(resolve, reject) {
			gulp.src('./dev/*.html')
				.pipe(usemin())
				.pipe(inject(gulp.src('./build/js/header.js', {
					read: false
				}), {
					ignorePath: 'build',
					removeTags: true,
					name: 'header'
				}))
				.pipe(revReplace({
					manifest: manifest
				}))
				.pipe(gulp.dest('./build'))
				.on('end', resolve)
			})
		]).then(function () {
			gulp.src('./build/**/*.html', {
		            read: false
		        })
		        .pipe(sitemap({
		            siteUrl: 'https://REPLACE-SITE-URL.com',
		            changefreq: 'monthly',
		            priority: 1
		        }))
		        .pipe(gulp.dest('./build'));
		})
});


// Cleanup files
gulp.task('cleanup', ['html'], function() {
	gulp.src('./dev/**/*.txt')
  		.pipe(gulp.dest('./build'));

	gulp.src('./dev/fonts/**/*')
  		.pipe(gulp.dest('./build/fonts'));

	del(['./build/rev-manifest.json', './build/**/*.rev']);
});


// Image minification
gulp.task('images', function() {
	return gulp.src('./dev/images/**/*')
		.pipe(imagemin([
			imagemin.jpegtran({ progressive: true }),
			imagemin.gifsicle({ interlaced: false }),
			imagemin.svgo({ plugins: [{
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
		})], {
				verbose: false,
				use: [pngquant()]
		}))
		.pipe(gulp.dest('./build/images'))
});


// Main build function
gulp.task('build', ['remove'], function() {
	return gulp.start(
		'cleanup',
		'images'
	)
});