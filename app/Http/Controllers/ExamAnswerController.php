<?php

namespace App\Http\Controllers;

use App\Models\ClassModel;
use App\Models\Exam;
use App\Models\ExamAnswer;
use App\Models\Student;
use App\Models\Teatcher;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\View\Factory;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;

class ExamAnswerController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return Application|Factory|View
     */
    public function index()
    {
        return view('admin.components.examiner.index');
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return Application|Factory|View|RedirectResponse
     */
    public function create(Request $request)
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
        unset($inputs['_token']);
        $class = ClassModel::find($student->class_id);
        $exam = Exam::where('class_id', $student->class_id)->where('type', $inputs['type'])->first();
        // $teacher_name = Teatcher::where('class_id', $student->class_id)->where('subject',$inputs['type'])->first()->name;
        $teacher_name = '';

        // $teacher_name = Teatcher::where('class_id', $student->class_id)->where('subject',$inputs['type'])->first()->name;
        $teacher_name = '';

        $class_name = ClassModel::find($student->class_id)->name;
        // $teacher_phone = Teatcher::where('class_id', $student->class_id)->where('subject',$inputs['type'])->first()->phone;
        $teacher_phone = '';

        // $teacher_phone = Teatcher::where('class_id', $student->class_id)->where('subject',$inputs['type'])->first()->phone;
        $teacher_phone = '';

        $questions = json_decode($exam->questions);
        $answers = [];
        foreach ($questions as $question) {
            if (isset($question->ans))
                $answers[] = $question->ans;
        }
        // dd($answers);
        foreach ($questions as $item) {
            $item->score = null;
        }
        $instructionsObject = null;
        foreach ($questions as $question) {
            if (isset($question->instructions)) {
                $instructionsObject = $question->instructions;
                break;
            }
        }
        //        $inputs['answers'] = $questions;
        $exam_answer = ExamAnswer::where('student_id', $inputs['student_id'])->where('type', $inputs['type'])->first();
        if (!$exam_answer) {

            $exam_answer = ExamAnswer::create($inputs);
            $exam_answer->answers = $questions;
            
            $exam_answer->save();
        } else {
            $exam_answer->answers = $questions;

            // $exam_answer->answers = json_decode($exam_answer->answers);
        }

        return view('admin.components.examiner.exam_show', compact('answers', 'teacher_phone', 'class_name', 'teacher_name', 'exam_answer', 'class', 'student', 'exam', 'instructionsObject'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     * @return Application|Factory|View|RedirectResponse
     */
    public function update(Request $request)
    {
        $inputs = $request->all();
        $validator = Validator::make($inputs, [
            'student_id' => 'required',
            'examiner' => 'required',
            'type' => 'required',
            'answers' => 'required'
        ]);
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }
        unset($inputs['_token']);
        $exam_answer = ExamAnswer::find($inputs['id']);
        $exam_answer->update($inputs);
        $exam_answer->save();
        Session::flash('success', 'لقد تم تسجيل الاجابات بنجاح');
        return view('admin.components.examiner.index');
    }
}