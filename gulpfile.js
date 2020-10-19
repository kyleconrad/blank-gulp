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
    	build: dirBuild + '/images'
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
	    gzip = require('gulp-gzip'),
		revise = require('gulp-revise'),
		revReplace = require('gulp-rev-replace'),
		sitemap = require('gulp-sitemap'),
		del = require('del');










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
		// .pipe( uglify() )
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
function remove( done ) {
	return rimraf( dirBuild, done );
}



// Copy CSS
function copyCSS() {
	return gulp
		.src( paths.styles.dest + '/*.css' )
		.pipe( gulp.dest( paths.styles.build ) )
		.pipe( revise() )
		.pipe( revise.write() )
		.pipe( gulp.dest( paths.styles.build ) );
}



// Copy JS
function copyJS() {
	return gulp
		.src( paths.scripts.dest + '/*.js' )
		.pipe( uglify({
			mangle: false
		}) )
		.pipe( gulp.dest( paths.scripts.build ) )
		.pipe( revise() )
		.pipe( revise.write() )
		.pipe( gulp.dest( paths.scripts.build ) );
}



// Copy images
function copyImages() {
	return gulp
		.src( paths.images.dest + '/**/*.*' )
		.pipe( gulp.dest( paths.images.build ) );
}



// Gzip
function gzipCSS() {
	return gulp
		.src( paths.styles.build + '/*.css' )
		.pipe( gzip() )
		.pipe( gulp.dest( paths.styles.build ) );
}

function gzipJS() {
	return gulp
		.src( paths.scripts.build + '/*.js' )
		.pipe( gzip() )
		.pipe( gulp.dest( paths.scripts.build ) );
}



// Merge revisions
function merge() {
	return gulp
		.src( dirBuild + '/**/*.rev' )
		.pipe( revise.merge( 'build' ) )
		.pipe( gulp.dest( dirBuild ) );
}



// Revise HTML
function reviseHTML() {
	var manifest = gulp.src( dirBuild + '/rev-manifest.json' );

	return gulp
		.src( paths.templates.dest + '/*.html' )
		.pipe( revReplace({
			manifest: manifest
		}))
		.pipe( gulp.dest( paths.templates.build ) )
		.pipe( sitemap({
			siteUrl: 'https://REPLACE-SITE-URL.com',
			changefreq: 'monthly',
			priority: 1
		}))
		.pipe( gulp.dest( paths.templates.build ) );
}



// Copy text & fonts, delete revision file
function copyTXT() {
	return gulp
		.src( dirDev + '/**/*.txt' )
		.pipe( gulp.dest( dirBuild ) );
}

function copyfonts() {
	return gulp
		.src( dirDev + 'fonts/**/*.*')
		.pipe( gulp.dest( dirBuild + '/fonts' ) );
}

function deleterev() {
	return del( [
	    dirBuild + '/rev-manifest.json',
	    dirBuild + '/**/*.rev'
	] );
}



// Build task
exports.build = series(
		remove,
		parallel(
			styles,
			html,
			headerJS,
			footerJS,
			images
		),
		parallel(
			copyCSS,
			copyJS,
			copyImages
		),
		parallel(
			gzipCSS,
			gzipJS,
			merge
		),
		reviseHTML,
		parallel(
	         copyTXT,
	         copyfonts,
	         deleterev
		)
	);
