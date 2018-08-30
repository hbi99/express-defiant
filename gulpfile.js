

/*-------------------------------------------------------------------------
 * Include Gulp & Tools We'll Use
 *
 *-------------------------------------------------------------------------*/

var colors      = require('colors'),
	gulp        = require('gulp'),
	$           = require('gulp-load-plugins')(),
	cleanCSS    = require('gulp-clean-css'),
	sequence    = require('run-sequence');

var include_options = {
		prefix    : '@@',
		basepath  : '@file'
	},
	srcPaths = {
		watch   : ['debug/**/*.*', '!debug/**/*.min.*'],
		html    : ['debug/html/*.{html,htm}'],
		scripts : ['debug/js/debug.js', '!debug/js/*.min.js'],
		styles  : ['debug/css/debug.less']
	},
	destPaths = {
		html   : 'debug/',
		script : 'debug/js/',
		styles : 'debug/css/'
	};


/*-------------------------------------------------------------------------
 * Gulp HELP
 *
 *-------------------------------------------------------------------------*/
gulp.task('help', function(done) {
	var str = '\n----DEVELOPMENT Mode-------------------------------------------------------------\n'+
			'\n  gulp devbuild'.cyan   +'\t\tDevelop debug view'.grey+
			'\n  gulp build'.cyan      +'\t\tCreates a build version of debug html'.grey+
			'\n----------------------------------------------------------------------------------\n';
	console.log(str);
	done();
});



/*-------------------------------------------------------------------------
 * Declaring tasks
 *
 *-------------------------------------------------------------------------*/

// Processes html files
gulp.task('html', function() {
	return gulp.src(srcPaths.html)
		.pipe($.fileInclude(include_options))
		.pipe($.rename({suffix: '.min'}))
		.pipe(gulp.dest(destPaths.html))
		.pipe($.size({title: 'html'}));
});

// Processes javascript files
gulp.task('scripts', function() {
	return gulp.src(srcPaths.scripts)
		.pipe($.fileInclude(include_options))
	//	.pipe($.uglifyes())
		.pipe($.rename({suffix: '.min'}))
		.pipe(gulp.dest(destPaths.script))
		.pipe($.size({title: 'scripts'}));
});

// Processes Less files
gulp.task('styles', function() {
	return gulp.src(srcPaths.styles)
		.pipe($.less())
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe($.rename({suffix: '.min'}))
		.pipe(gulp.dest(destPaths.styles))
		.pipe($.size({title: 'styles'}));
});

// Watch source files and moves them accordingly
gulp.task('watch', function() {
	gulp.watch(srcPaths.watch, ['build']);
});

// This task is for building for platforms
gulp.task('devbuild', function(cb) {
	sequence(['build'], 'watch', cb);
});

// This task is for building for platforms
gulp.task('build', function(cb) {
	sequence(['scripts', 'styles'], 'html', cb);
});


