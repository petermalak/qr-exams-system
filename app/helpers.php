<?php

use App\Models\AboutUs;
use App\Models\Service;
use App\Models\Setting;
use App\Models\Translation;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;


/**
 * @param string|null $lang
 * @param $key
 * @param $value
 * @return mixed
 */

if (!function_exists('areActiveRoutes')) {
    function areActiveRoutes(array $routes, $output = "active")
    {
        foreach ($routes as $route) {
            if (Route::currentRouteName() == $route) return $output;
            if (str_contains($route, "*")) {
                $params = explode(".", $route);
                $currentRouteParams = explode(".", Route::currentRouteName());
                if ($params[0] == $currentRouteParams[0] && $params[1] == '*') return $output;
            }
        }
    }
}

if (!function_exists("gallery")) {
    function gallery($filename)
    {
        return asset("uploads/gallery/{$filename}");
    }
}

// if (!function_exists("getUpload")) {
//     /**
//      * @param $id
//      * @return string
//      */
//     function getUpload($el, $col = "upload_id"): string
//     {
//         if (is_array($el)) $id = $el[$col];
//         else $id = $el;
//         $upload = \App\Models\Upload::find($id);
//         if (!$upload) return asset("frontend/images/placeholder.jpg");
//         return asset("uploads/gallery/{$upload->file_name}");
//     }
// }

if (!function_exists("lang")) {
    function lang(): string
    {
        return app()->getLocale();
    }
}

if (!function_exists("withUpload")) {
    function withUpload(array $cast)
    {
        return array_merge($cast, ["upload_id" => "required"]);
    }
}

if (!function_exists("messageUpload")) {
    /**
     * @return array
     */
    function messageUpload()
    {
        return ['upload_id.required' => __("validation.upload_required")];
    }
}

if (!function_exists("title")) {
    /**
     * @param string $title
     * @return string
     */
    function title($title = "")
    {
        if (isset($title) && $title != "") {
            return env("SITE_NAME", "SDHDS") . " | " . $title;
        } else {
            $routeArray = app('request')->route()->getAction();
            $controllerAction = class_basename($routeArray['controller']);
            list($controller, $action) = explode('@', $controllerAction);
            $controller = str_replace("Controller", "", $controller);
            return env("SITE_NAME", "SDHDS Admin") . " | " . $controller;
        }
    }
}

if (!function_exists("reverse_slug")) {
    /**
     * @param $slug
     * @return string
     */
    function reverse_slug($slug): string
    {
        return Str::title(str_replace('-', ' ', $slug));
    }
}

if (!function_exists("convert_to_int")) {
    /**
     * @param $array
     * @param $offset
     * @return mixed
     */
    function convert_to_int($array, $offset = null)
    {
        $result = [];
        $array = json_decode($array);
        if ($offset != null) {
            if (is_array($array))
                foreach ($array as $item) {
                    $result[] = (int)$item[$offset];
                }
        } else {
            if (is_array($array))
                foreach ($array as $item) {
                    $result[] = (int)$item;
                }
        }
        return $result;

    }
}

// if (!function_exists("getSettingImage")) {
//     /**
//      * @param $array
//      * @param $offset
//      * @return mixed
//      */
//     function getSettingImage($name)
//     {
//         $item = Setting::where('type','like',$name)->first();
//         if (!$item)return asset("frontend/images/placeholder.jpg");
//         $upload = \App\Models\Upload::find($item->value);
//         if (!$upload) return asset("frontend/images/placeholder.jpg");
//         return asset("uploads/gallery/{$upload->file_name}");
//     }
// }
// if (!function_exists("getSettingText")) {
//     /**
//      * @param $array
//      * @param $offset
//      * @return mixed
//      */
//     function getSettingText($name)
//     {
//         $item = Setting::where('type','like',$name)->first();
//         if (!$item) return '#';
//         return $item->value;
//     }
// }

// if (!function_exists("getServices")) {
//     /**
//      * @param $array
//      * @param $offset
//      * @return mixed
//      */
//     function getServices()
//     {
//         $services = Service::all(['id','title']);
//         return $services;
//     }
// }

// if (!function_exists("getAboutUSImage")) {
//     /**
//      * @param $array
//      * @param $offset
//      * @return mixed
//      */
//     function getAboutUSImage($name)
//     {
//         $item = AboutUs::where('type','like',$name)->first();
//         if (!$item)return asset("frontend/images/placeholder.jpg");
//         $upload = \App\Models\Upload::find($item->value);
//         if (!$upload) return asset("frontend/images/placeholder.jpg");
//         return asset("uploads/gallery/{$upload->file_name}");
//     }
// }