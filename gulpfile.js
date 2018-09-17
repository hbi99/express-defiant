

/*-------------------------------------------------------------------------
 * Include Gulp & Tools We'll Use
 *
 *-------------------------------------------------------------------------*/

var colors   = require('colors'),
	gulp     = require('gulp'),
	$        = require('gulp-load-plugins')(),
	cleanCSS = require('gulp-clean-css'),
	del      = require('del');

var include_options = {
		prefix    : '@@',
		basepath  : '@file'
	},
	srcPaths = {
		watch   : ['debug/**/*.*', '!debug/build/**/*.*'],
		html    : ['debug/index.htm'],
		scripts : ['debug/js/debug.js', '!debug/js/*.min.js'],
		styles  : ['debug/css/debug.less'],
		svg     : ['debug/svg/*.svg', '!debug/svg/svg-symbols.svg']
	},
	destPaths = {
		html   : 'debug/build/',
		script : 'debug/build/js/',
		styles : 'debug/build/css/',
		svg    : 'debug/build/svg/'
	},
	svgOptions = {
		id       : 'symbol-%f',
		className: '.svg-symbol.symbol-%f',
		templates: ['default-svg']
	};


/*-------------------------------------------------------------------------
 * Gulp HELP
 *
 *-------------------------------------------------------------------------*/
gulp.task('help', (done) => {
	var str = '\n----DEVELOPMENT Mode-------------------------------------------------------------\n'+
			'\n  gulp devbuild'.cyan   +'\t\tDevelop debug view'.grey+
			'\n  gulp build'.cyan      +'\t\tCreates a build version of debug html'.grey+
			'\n----------------------------------------------------------------------------------\n';
	console.log(str);
	done();
});

function clean() {
	return del(destPaths.html);
}

function scripts() {
	return gulp.src(srcPaths.scripts)
		.pipe($.fileInclude(include_options))
	//	.pipe($.uglifyes())
		.pipe($.rename({suffix: '.min'}))
		.pipe(gulp.dest(destPaths.script))
		.pipe($.size({title: 'scripts'}));
};

function styles() {
	return gulp.src(srcPaths.styles)
		.pipe($.less())
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe($.rename({suffix: '.min'}))
		.pipe(gulp.dest(destPaths.styles))
		.pipe($.size({title: 'styles'}));
}

function svg() {
	return gulp.src(srcPaths.svg)
		.pipe($.svgSymbols(svgOptions))
		.pipe(gulp.dest(destPaths.svg))
		.pipe($.size({title: 'svg'}));
}

function html() {
	return gulp.src(srcPaths.html)
		.pipe($.fileInclude(include_options))
		.pipe(gulp.dest(destPaths.html))
		.pipe($.size({title: 'html'}));
}

function watch() {
	gulp.watch(srcPaths.watch, build);
}


var build = gulp.series(gulp.parallel(svg, scripts, styles), html);

gulp.task('clean', clean);
gulp.task('scripts', scripts);
gulp.task('styles', styles);
gulp.task('svg', svg);
gulp.task('html', html);
gulp.task('build', build);
gulp.task('watch', watch);



