Blank project base with Gulp.js as the build system.

## Local Setup 
Running local set up will install all necessary bundles and then run a server with livereload. It watches all SASS, JS, and images, then compiles/concats and reloads accordingly.
    
    $ npm install -g gulp
    $ cd blank-gulp
    $ npm install
    $ bundle install
    $ gulp

## Building
Building will remove all files from the 'dist' directory, compile and minify all SASS/CSS, concat and uglify all JS, minify all images, and copy all HTML. This will result with the entire site ready in the 'dist' directory upon completion.

    $ cd blank-gulp
    $ gulp build
