var elixir = require('laravel-elixir');

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Sass
 | file for our application, as well as publishing vendor resources.
 |
 */

elixir.config.assetsPath = 'front/app/';

var gulp = require('gulp');

var htmlbuild = require('gulp-htmlbuild');

gulp.task('default', function () {

    gulp.src(['front/app/views/**/*.html'])
            .pipe(htmlbuild({
                js: htmlbuild.preprocess.js(function (block) {
                    block.write('buildresult.js');
                    block.end();
                })
            }))
            .pipe(gulp.dest('public/front/views/'));

    elixir(function (mix) {

        mix.sass([
            'app.scss'
        ], 'public/css', 'front/app/sass');

        mix.scripts([
            'app.js'
        ], 'public/front/scripts/app.js', 'front/app/scripts');

        mix.scripts([
            'dashboard/dashboardControllers.js',
            'body/bodyControllers.js',
            'register/registerControllers.js',
            'admin/adminControllers.js',
            'users/usersControllers.js',
            'places/placesControllers.js',
            'places-list/placesControllers.js',
            'poll/pollControllers.js',
            'opinions/opinionsControllers.js',
            'poll-answers/pollAnswersControllers.js',
            'pollster/pollstersControllers.js',
            'map/mapControllers.js',
            'rank/rankControllers.js'
        ], 'public/front/scripts/controllers.js', 'front/app/scripts');

        mix.scripts([
            'body/bodyDirectives.js'
        ], 'public/front/scripts/directives.js', 'front/app/scripts');
        
        mix.scripts([
            'body/bodyServices.js',
            'map/mapService.js',
            'map/localizationMapService.js'
        ], 'public/front/scripts/services.js', 'front/app/scripts');

    });
});
