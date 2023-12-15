<?php

use App\Http\Controllers\ClassModelController;
use App\Http\Controllers\ExamAnswerController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ExamQuestionsAnswerController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\WrittenExamController;
use Illuminate\Support\Facades\Route;
use App\Models\ExamAttendance;
use App\Models\ExamQuestionsAnswer;

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

Route::prefix('questions')->group(function () {
    Route::post('/import', [QuestionController::class, 'import_questions'])->name('import-questions');
    Route::get('/import', [QuestionController::class, 'upload_file'])->name('import-question-view');
    Route::get('/import-array', [QuestionController::class, 'test'])->name('aaa');
    Route::post('/import-array', [QuestionController::class, 'import_questions_array'])->name('ttt');
});

Route::prefix('written-exams')->group(function () {
    Route::post('/import', [WrittenExamController::class, 'import_exmas'])->name('import-written-exams');
    Route::get('/import', [WrittenExamController::class, 'upload_file'])->name('import-written-exams-view');
});

Route::resource('/take-written-exam', ExamQuestionsAnswerController::class)->only('index', 'create');
Route::post('/take-written-exam', [ExamQuestionsAnswerController::class, 'update'])->name('take-written-exam.update');


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

Route::prefix('agbeya')->group(function () {
    Route::get('/', function () {
        return view('admin.components.home');
    });
    Route::get('/exam',  [AttendanceController::class, 'agbeya_index'])->name('attendance.agbeya_table');
});

Route::get('/main', function () {
    return view('admin.main');
});

Route::get('/q', function () {
    $exams_attendance = ExamAttendance::where('in_hall', 1)->get();
    foreach ($exams_attendance as $attendance) {
        $attendance->coptic = 1;
        $attendance->taks = 1;
        $attendance->save();
    }
    return 'nice';
});

Route::get('/test', function () {
    return view('admin.test');
});
