<?php

use App\Http\Controllers\Admin\ScoreController;
use App\Http\Controllers\ClassModelController;
use App\Http\Controllers\ExamAnswerController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ExamQuestionsAnswerController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\WrittenExamController;
use App\Http\Controllers\ExamRouteController;
use Illuminate\Support\Facades\Route;
use App\Models\ExamAttendance;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

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

Auth::routes(['register' => true]);
Route::get('/login', function () {
    return view('admin.dashboard.auth.login');
})->name('login');

Route::group(['prefix' => 'sdhds', 'middleware' => 'auth'], function () {
    Route::get('/', [ScoreController::class, 'index'])->name("dashboard");
    Route::resource('scores', ScoreController::class);
});

// Route::middleware(['auth'])->group(function () {
Route::prefix('students')->group(function () {
    Route::post('/import', [StudentController::class, 'import_students'])->name('import-students');
    Route::get('/import', [StudentController::class, 'upload_file'])->name('import-student-view');
    Route::get('/export', [StudentController::class, 'export_exam_attendance'])->name('export-file');
    Route::get('/export-answers', [StudentController::class, 'export_exam_answers'])->name('export-answers');
    Route::get('/exportAnswers', [StudentController::class, 'examAnswersIndex']);
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

Route::prefix('attendance')->group(function () {
    Route::post('/import', [AttendanceController::class, 'import_exmas'])->name('import-attendance');
    Route::get('/import', [AttendanceController::class, 'upload_file'])->name('import-attendance-view');
});

Route::get('/examRoute', [ExamRouteController::class, 'RouteToExam'])->name('RouteToExam');


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


Route::get('/', function () {
    return view('admin.main');
});


Route::get('/peter', function () {
    User::create([
        'name' => 'Admin',
        'email' => 'admin@admin.com',
        'password' => Hash::make('123456789'),
    ]);
    return "hahahah";
});




