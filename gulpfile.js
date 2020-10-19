// Paths for Sass, JavaScript, Images, and Templates
var dirDev = './dev',
	dirBuild = './build';

var paths = {
    styles: {
    	watch: dirDev + '/sass/**/*.scss',
        src: dirDev + '/sass/*.scss',
        dest: dirDev + '/css',
        build: dirBuild + '/css'
    },
    scripts: {
    	header: dirDev + '/js/lib/*.js',
    	footer: dirDev + '/js/*.js',
    	dest: dirDev + '/js',
    	build: dirBuild + '/js'
    },
    images: {
    	src: dirDev + '/images/**/*.*',
    	dest: dirDev + '/images',
    	build: dirBuild + '/js'
    },
    templates: {
    	watch: dirDev + '/templates/**/*.tpl.html',
    	src: dirDev + '/templates/*.tpl.html',
    	base: dirDev + '/templates/',
    	dest: dirDev,
    	build: dirBuild
    }
};










// =================================================================================== //










const 	{ parallel } = require('gulp'),
		{ series } = require('gulp');



var 	gulp = require('gulp'),

		// BrowserSync
		browserSync = require('browser-sync').create(),

		// Required for HTML
		fileinclude = require('gulp-file-include'),
		rename = require('gulp-rename'),

		// Required for Sass & CSS
		sass = require('gulp-sass'),
		sourcemaps = require('gulp-sourcemaps'),
		autoprefixer = require('gulp-autoprefixer'),
		cleanCSS = require('gulp-clean-css'),

		// Required for JS
		concat = require('gulp-concat'),
		uglify = require('gulp-uglify'),

		// Required for images
		newer = require('gulp-newer'),
		imagemin = require('gulp-imagemin'),
	    pngquant = require('imagemin-pngquant'),
	    zopfli = require('imagemin-zopfli'),
	    jpegtran = require('imagemin-jpegtran'),
	    mozjpeg = require('imagemin-mozjpeg'),
	    giflossy = require('imagemin-giflossy'),

	    // Required for build
	    rimraf = require('rimraf'),
	    sitemap = require('gulp-sitemap');



// var gulp = require('gulp'),

// 	// Server & BrowserSync
// 	browserSync = require('browser-sync').create(),

// 	// Required for development
// 	sass = require('gulp-sass'),
// 	autoprefixer = require('gulp-autoprefixer'),
// 	sourcemaps = require('gulp-sourcemaps'),
// 	fileinclude = require('gulp-file-include'),
// 	rename = require('gulp-rename'),

// 	// Required for build
// 	rimraf = require('rimraf'),
// 	del = require('del'),
// 	cleanCSS = require('gulp-clean-css'),
// 	revise = require('gulp-revise'),
// 	revReplace = require('gulp-rev-replace'),
// 	concat = require('gulp-concat'),
// 	uglify = require('gulp-uglify'),
// 	gzip = require('gulp-gzip'),
// 	usemin = require('gulp-usemin'),
// 	inject = require('gulp-inject'),

// 	imagemin = require('gulp-imagemin'),
//     pngquant = require('imagemin-pngquant'),
//     zopfli = require('imagemin-zopfli'),
//     mozjpeg = require('imagemin-mozjpeg'),
//     giflossy = require('imagemin-giflossy'),

//     sitemap = require('gulp-sitemap');





// =================================================================================== //
// Development
// =================================================================================== //

// Reload
function reload( done ) {
	browserSync.reload();



	done();
}



// Styles
function styles() {
	return gulp
		.src( paths.styles.src )
		.pipe( sourcemaps.init() )
		.pipe( sass({
        	errLogToConsole: true
        }) )
        .on( 'error', console.error.bind( console ) )
        .pipe( autoprefixer({
			overrideBrowserslist: ['since 2012'],
			cascade: false
		}) )
		.pipe( cleanCSS({
			compatibility: '*',
			specialComments: 1
		}) )
		.pipe( sourcemaps.write( '' ) )
		.pipe( gulp.dest( paths.styles.dest ) )
		.pipe( browserSync.stream() );
}



// Compile all HTML from templates and includes
function html() {
	return gulp
		.src( paths.templates.src )
		.pipe(fileinclude({
			prefix: '@@',
			basepath: paths.templates.base
		}))
		.pipe(rename({
 			extname: ''
		}))
		.pipe(rename({
 			extname: '.html'
 		}))
 		.pipe( gulp.dest( paths.templates.dest ) );
}



// Header JavaScript
function headerJS() {
	return gulp
		.src( paths.scripts.header )
		.pipe( sourcemaps.init() )
		.pipe( concat({
			path: 'header.js',
			cwd: ''
		}) )
		.pipe( uglify({
			mangle: false
		}) )
		.pipe( sourcemaps.write( '' ) )
		.pipe( gulp.dest( paths.scripts.dest ) );
}



// Footer JavaScript
function footerJS() {
	return gulp
		.src( paths.scripts.footer )
		.pipe( uglify() )
		.pipe( gulp.dest( paths.scripts.dest ) );
}



// Images
function images() {
	return gulp
		.src( paths.images.src )
		.pipe( newer( paths.images.dest ) )
		.pipe( imagemin( [
			// PNG
			pngquant({
				speed: 1,
				quality: [ 0.8, 0.9 ]
			}),
			zopfli({
				more: true
            }),

			// SVG
			imagemin.svgo({
				plugins: [
					{
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
            		}
				]
			}),

			// JPG
			jpegtran({
				progressive: true,
				arithmetic: false
			}),
			mozjpeg({
            	quality: 90
            }),

			// GIF
			giflossy({
            	optimize: 3,
            	optimizationLevel: 3,
            	lossy: 30
            })
        ] ))
		.pipe( gulp.dest( paths.images.dest ) );
}



// Start BrowserSync and watch files
function serve( done ) {
	browserSync.init({
		server: {
			baseDir: dirDev
		},
		host: 'localhost',
		open: true
    });



    done();
}

function watch() {
    gulp.watch( paths.styles.watch, styles );

    gulp.watch( paths.templates.watch, series( html, reload ) );

    gulp.watch( paths.scripts.header, series( headerJS, reload ) );
    gulp.watch( paths.scripts.footer, series( footerJS, reload ) );

    gulp.watch( paths.images.src, series( images, reload ) );
}



// Default task
exports.default = series(
		parallel(
			styles,
			html,
			headerJS,
			footerJS,
			images
		),
		serve,
		watch
	);





// =================================================================================== //
// Build
// =================================================================================== //


// Clear build directory
gulp.task('remove', function(cb) {
    return rimraf('./build', cb);
});


// // Minify CSS
// gulp.task('minify', ['sass'], function() {
// 	return gulp.src('./dev/css/*.css')
// 		.pipe(cleanCSS({
// 			compatibility: '*',
// 			specialComments: 'all'
// 		}))
// 		.pipe(gulp.dest('./build/css'))
// 		.pipe(revise())
// 		.pipe(revise.write())
// 		.pipe(gulp.dest('./build/css'))
// });


// // Concat and uglify JavaScript
// gulp.task('scripts', function() {
// 	gulp.src('./dev/js/*.js')
// 		.pipe(uglify())
// 		.pipe(gulp.dest('./build/js'))
// 		.pipe(revise())
// 		.pipe(revise.write())
// 		.pipe(gulp.dest('./build/js'));

// 	gulp.src('./dev/js/lib/*.js')
// 		.pipe(sourcemaps.init())
// 		.pipe(concat({
// 			path: 'header.js',
// 			cwd: ''
// 		}))
// 		.pipe(uglify({
// 			mangle: false
// 		}))
// 		.pipe(sourcemaps.write(''))
// 		.pipe(gulp.dest('./build/js'))
// 		.pipe(revise())
// 		.pipe(revise.write())
// 		.pipe(gulp.dest('./build/js'));
// });


// // Gzip CSS and JavaScript
// gulp.task('gzip', ['scripts', 'minify'], function() {
// 	gulp.src('./build/js/*.js')
// 		.pipe(gzip())
//         .pipe(gulp.dest('./build/js'));

//     gulp.src('./build/css/*.css')
//     	.pipe(gzip())
//     	.pipe(gulp.dest('./build/css'));
// });


// // Merge revisions into revision file
// gulp.task('merge', ['gzip'], function() {
// 	return gulp.src('./build/**/*.rev')
// 		.pipe(revise.merge('build'))
// 		.pipe(gulp.dest('./build'))
// });


// // Build HTML files, use revision file, generate sitemap
// gulp.task('html', ['merge'], function(cb) {
// 	var manifest = gulp.src('./build/rev-manifest.json');

// 	return Promise.all([
// 		new Promise(function(resolve, reject) {
// 			gulp.src('./dev/*.html')
// 				.pipe(usemin())
// 				.pipe(inject(gulp.src('./build/js/header.js', {
// 					read: false
// 				}), {
// 					ignorePath: 'build',
// 					removeTags: true,
// 					name: 'header'
// 				}))
// 				.pipe(revReplace({
// 					manifest: manifest
// 				}))
// 				.pipe(gulp.dest('./build'))
// 				.on('end', resolve)
// 			})
// 		]).then(function () {
// 			gulp.src('./build/**/*.html', {
// 		            read: false
// 		        })
// 		        .pipe(sitemap({
// 		            siteUrl: 'https://REPLACE-SITE-URL.com',
// 		            changefreq: 'monthly',
// 		            priority: 1
// 		        }))
// 		        .pipe(gulp.dest('./build'));
// 		})
// });


// // Cleanup files
// gulp.task('cleanup', ['html'], function() {
// 	gulp.src('./dev/**/*.txt')
//   		.pipe(gulp.dest('./build'));

// 	gulp.src('./dev/fonts/**/*')
//   		.pipe(gulp.dest('./build/fonts'));

// 	del(['./build/rev-manifest.json', './build/**/*.rev']);
// });


// // Image minification
// gulp.task('images', function() {
// 	return gulp.src('./dev/images/**/*')
// 		.pipe(imagemin([
//            	// PNG
//            	pngquant({
// 				speed: 1,
// 				quality: 98
// 			}),
// 			zopfli({
// 				more: true
//             }),

//             // SVG
//             imagemin.svgo({
//             	plugins: [
//             		{
//             			removeViewBox: false
//             		},
//             		{
//             			cleanupIDs: false
//             		},
//             		{
//             			collapseGroups: false
//             		},
//             		{
//             			convertShapeToPath: false
//             		}
//             	]
//             }),

//             // JPG
//             imagemin.jpegtran({
//             	progressive: true
//             }),
//             mozjpeg({
//             	quality: 90
//             }),

//             // GIF
//             giflossy({
//             	optimize: 3,
//             	optimizationLevel: 3,
//             	lossy: 30
//             })
// 		]))
// 		.pipe(gulp.dest('./build/images'))
// });


// // Main build function
// gulp.task('build', ['remove'], function() {
// 	return gulp.start(
// 		'cleanup',
// 		'images'
// 	)
// });