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

Route::get('/', function () { return view('admin.components.home'); })->name('home');

Route::resource('/exam-attendances', AttendanceController::class)->only('create');
Route::post('/exam-attendances',  [ AttendanceController::class,'get_student_exam_data' ])->name('exam-attendances.show');

Route::prefix('door')->group(function () {
    Route::get('/', function () { return view('admin.components.home'); })->name('home');
    Route::post('/exam-attendances',  [ AttendanceController::class,'exitAttendance' ])->name('attendance.exit');
});


//Route::post('/exam-attendances/exit',  [ AttendanceController::class,'exitAttendance' ])->name('attendance.exit');

Route::prefix('alhan')->group(function () {
    Route::get('/exam-attendances',  [ AttendanceController::class,'alhan_index' ])->name('attendance.alhan_table');
    Route::post('/exam-attendances',  [ AttendanceController::class,'alhanAttendance' ])->name('attendance.alhan');
});

Route::prefix('coptic')->group(function () {
    Route::get('/exam-attendances',  [ AttendanceController::class,'coptic_index' ])->name('attendance.coptic_table');
    Route::post('/exam-attendances',  [ AttendanceController::class,'copticAttendance' ])->name('attendance.coptic');

});

Route::prefix('taks')->group(function () {
    Route::get('/exam-attendances',  [ AttendanceController::class,'taks_index' ])->name('attendance.taks_table');
    Route::post('/exam-attendances',  [ AttendanceController::class,'taksAttendance' ])->name('attendance.taks');
});

Route::resource('/students', StudentController::class);
