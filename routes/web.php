<?php

use App\Http\Controllers\StudentController;
use App\Http\Controllers\AttendanceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('admin.components.home');
})->name('home');

Route::resource('/exam-attendances', AttendanceController::class);
Route::post('/exam-attendances/alhan',  [ AttendanceController::class,'alhanAttendance' ])->name('attendance.alhan');
Route::post('/exam-attendances/coptic',  [ AttendanceController::class,'copticAttendance' ])->name('attendance.coptic');
Route::post('/exam-attendances/taks',  [ AttendanceController::class,'taksAttendance' ])->name('attendance.taks');
Route::post('/exam-attendances/exit',  [ AttendanceController::class,'exitAttendance' ])->name('attendance.exit');


Route::resource('/students', StudentController::class);
