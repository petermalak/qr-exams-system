<?php

namespace App\Http\Controllers;

use App\Models\ClassModel;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ExamRouteController extends Controller
{
    public function RouteToExam(Request $request)
    {

        $inputs = $request->all();
        $validator = Validator::make($inputs, ['student_id' => 'required', 'examiner' => 'required', 'type' => 'required']);
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }
        unset($inputs['_token']);
        $student = Student::find($inputs['student_id']);
        if (!$student) {
            return redirect()->back()->withErrors(['error' => 'Student not found'])->withInput();
        }
        $class = ClassModel::find($student->class_id);

        $written_start = env("WRITTEN_START");

        if ($inputs['type'] == 'alhan' || $inputs['type'] == 'agbeya') {
            return (new ExamAnswerController())->create($request);
        } else {
            if ((int)$class->id < (int)$written_start) {
                return (new ExamAnswerController())->create($request);
            } else {
                return (new ExamQuestionsAnswerController())->create($request);
            }
        }
    }
}
