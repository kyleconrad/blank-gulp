Blank project base with Gulp.js as the build system, Sass and Bourbon for mix-ins and handy CSS pre-processing, HTML templates and modules, and a few other little things scattered throughout to make preparing a blank website that much easier.



## Local Setup
Running local set up will install all necessary bundles and dependencies and then run a server with BrowserSync. It watches all Sass, JS, and images, then compiles and reloads accordingly.
    
    $ cd blank-gulp
    $ npm install --global gulp-cli
    $ npm install
    $ bundle install
    $ gulp


## Building
Building will remove all files from the 'build' directory, compile and minify all Sass/CSS, concat and uglify all JS, minify all images, and process and copy all HTML. This will result with the entire site ready in the 'build' directory upon completion.

    $ cd blank-gulp
    $ gulp build
