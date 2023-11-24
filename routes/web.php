<?php

use App\Http\Controllers\ClassModelController;
use App\Http\Controllers\ExamAnswerController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\AttendanceController;
use Illuminate\Support\Facades\Route;
use App\Models\ExamAttendance;

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

Route::prefix('students')->group(function () {
    Route::post('/import', [StudentController::class, 'import_students'])->name('import-students');
    Route::get('/import', [StudentController::class, 'upload_file'])->name('import-student-view');
    Route::get('/export', [StudentController::class, 'export_exam_attendance'])->name('export-file');
    Route::get('/export-answers', [StudentController::class, 'export_exam_answers'])->name('export-answers');

});

Route::prefix('classes')->group(function () {
    Route::post('/import', [ClassModelController::class, 'import_classes'])->name('import-classes');
    Route::get('/import', [ClassModelController::class, 'upload_file'])->name('import-class-view');
});

Route::prefix('exams')->group(function () {
    Route::post('/import', [ExamController::class, 'import_exams'])->name('import-exams');
    Route::get('/import', [ExamController::class, 'upload_file'])->name('import-exam-view');
});

Route::resource('/take-exam', ExamAnswerController::class)->only('index', 'create');
Route::post('/take-exam', [ExamAnswerController::class, 'update'])->name('take-exam.update');






Route::resource('/exam-attendances', AttendanceController::class)->only('create');
Route::post('/exam-attendances',  [AttendanceController::class, 'get_student_exam_data'])->name('exam-attendances.show');

Route::prefix('door-entrance')->group(function () {
    Route::get('/', function () {
        return view('admin.components.home');
    });
});
Route::prefix('door-exit')->group(function () {
    Route::get('/', function () {
        return view('admin.components.home');
    });
});

Route::prefix('alhan')->group(function () {
    Route::get('/', function () {
        return view('admin.components.home');
    });
    Route::get('/exam',  [AttendanceController::class, 'alhan_index'])->name('attendance.alhan_table');
});

Route::prefix('coptic')->group(function () {
    Route::get('/', function () {
        return view('admin.components.home');
    });
    Route::get('/exam',  [AttendanceController::class, 'coptic_index'])->name('attendance.coptic_table');
});

Route::prefix('taks')->group(function () {
    Route::get('/', function () {
        return view('admin.components.home');
    });
    Route::get('/exam',  [AttendanceController::class, 'taks_index'])->name('attendance.taks_table');
});

Route::get('/main', function () {
    return view('admin.main');
});

Route::get('/q', function () {
    $exams_attendance = ExamAttendance::where('in_hall' , 1)->get();
    foreach($exams_attendance as $attendance ){
        $attendance->coptic = 1;
        $attendance->taks = 1;
        $attendance->save();
    }
    return 'nice';
});

Route::get('/test', function () {
    return view('admin.test');
});
