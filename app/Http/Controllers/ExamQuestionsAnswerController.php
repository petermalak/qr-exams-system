<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ClassModel;
use App\Models\Exam;
use App\Models\ExamAnswer;
use App\Models\ExamQuestionsAnswer;
use App\Models\Question;
use App\Models\Student;
use App\Models\WrittenExam;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\View\Factory;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;

class ExamQuestionsAnswerController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return Application|Factory|View
     */
    public function index()
    {
        return view('admin.components.examiner.written');
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
        $exam = WrittenExam::where('class_id', $student->class_id)->where('type', $inputs['type'])->first();

        $teacher_name = '';

        $class_name = ClassModel::find($student->class_id)->name;
        $teacher_phone = '';

        $questions = Question::where('written_exam_id', $exam->id)->get();
        $answers = [];
        // foreach ($questions as $question) {
        //     if (isset($question->answer))
        //         $answers[] = $question->answer;
        // }
        // dd($answers);

        foreach ($questions as $item) {
            $item->score = 0;
            $item->examiner =  $inputs['examiner'];
        }


        // $question_answer = ExamQuestionsAnswer::where('student_id', $inputs['student_id'])->where('question_id', $questions[0]->id)->first();
        // if ($question_answer) {
        //     Session::flash('error', 'لا يمكن الدخول لنفس الامتحان مرتين');
        //     return redirect()->back()->withInput();
        // }

        $exam_answer = null;
        $examiner = $inputs['examiner'];
        return view('admin.components.examiner.written_exam_show', compact('answers', 'teacher_phone', 'class_name', 'teacher_name', 'exam_answer', 'class', 'student', 'exam', 'examiner', 'questions'));
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

        foreach ($inputs['answers'] as $key => $value) {

            $question_answer = ExamQuestionsAnswer::where('student_id', $inputs['student_id'])->where('question_id', $value['question_id'])->first();
            if (!$question_answer) {
                ExamQuestionsAnswer::create([
                    'examiner' => $inputs['examiner'],
                    'wight' => $value['wight'],
                    'score' => $value['score'] ?? 0,
                    'question_id' => $value['question_id'],
                    'student_id' => $inputs['student_id'],
                    'type' => $inputs['type']
                ]);
            }
            else{
                $question_answer->score = $value['score'] ?? 0;
                $question_answer->save();               
            }
        }
        Session::flash('success', 'لقد تم تسجيل الاجابات بنجاح');
        return view('admin.components.examiner.written');
    }
}
