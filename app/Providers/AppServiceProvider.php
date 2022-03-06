<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Schema::defaultStringLength(191);
        Blade::if("dev", function () {
            return app()->env == "local" || app()->env == "dev" || app()->env == "development";
        });

        // if (App::environment('production') ||  env("APP_ENV", "production"))
        // {
        //    resolve(\Illuminate\Routing\UrlGenerator::class)->forceScheme('https');
        //    $this->app['request']->server->set('HTTPS', true);

        // }
    }
}
