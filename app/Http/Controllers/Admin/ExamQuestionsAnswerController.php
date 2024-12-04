<?php

namespace App\Http\Controllers\Admin;

use App\DataTables\ExamQuestionsAnswersDataTable;
use App\Http\Controllers\Controller;
use App\Models\ExamQuestionsAnswer;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ExamQuestionsAnswerController extends Controller
{
    public function index(ExamQuestionsAnswersDataTable $dataTable)
    {
        return $dataTable->render('admin.dashboard.components.exam-questions-answer.index');
    }

    public function create()
    {
        $examQuestionsAnswer = new ExamQuestionsAnswer();
        return view('admin.dashboard.components.exam-questions-answer.create', compact('examQuestionsAnswer'));
    }

    public function store(Request $request)
    {
        $inputs = $request->all();
        $validator = Validator::make($inputs, ExamQuestionsAnswer::$cast);
        if ($validator->fails()) {
            return redirect()->route('exam-questions-answers.create')->withErrors($validator)->withInput();
        }
        ExamQuestionsAnswer::create($inputs);
        return redirect()->route('exam-questions-answers.index')->with(['success' => 'ExamQuestionsAnswer ' . __("messages.add")]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\ExamAttendance  $ExamAttendance
     * @return \Illuminate\Http\Response
     */
    public function show(ExamQuestionsAnswer $ExamAttendance)
    {
        //
    }

    public function edit($student_id, $type)
    {
        // $examQuestionsAnswers = ExamQuestionsAnswer::where('student_id', $studentId)
        //     ->where('type', $type)
        //     ->get();
        // Fetch ExamQuestionsAnswers by student_id and type
        $examQuestionsAnswers = ExamQuestionsAnswer::where('student_id', $student_id)
            ->where('type', $type)
            ->get();

        // Fetch the related questions
        foreach ($examQuestionsAnswers as $examQuestionsAnswer) {
            $examQuestionsAnswer->question = Question::find($examQuestionsAnswer->question_id);
        }

        return view('admin.dashboard.components.exam-questions-answer.edit', compact('student_id', 'type', 'examQuestionsAnswers'));
    }


    public function update(Request $request, $studentId, $type)
    {
        $inputs = $request->all();
        $examQuestionsAnswers = ExamQuestionsAnswer::where('student_id', $studentId)
            ->where('type', $type)
            ->get();

            dd($examQuestionsAnswers , $inputs);

        foreach ($examQuestionsAnswers as $examQuestionsAnswer) {
            $data = [
                'wight' => $inputs['answers'][$examQuestionsAnswer->id]['wight'],
                'score' => $inputs['answers'][$examQuestionsAnswer->id]['score'],
            ];

            $validator = Validator::make($data, ExamQuestionsAnswer::$cast);
            if ($validator->fails()) {
                return redirect()->route('exam-questions-answers.edit', ['studentId' => $studentId, 'type' => $type])
                    ->withErrors($validator)
                    ->withInput();
            }

            $examQuestionsAnswer->update($data);
        }

        return redirect()->route('exam-questions-answers.index')->with(['success' => 'ExamQuestionsAnswer ' . __("messages.update")]);
    }



    public function destroy(ExamQuestionsAnswer $examQuestionsAnswer)
    {
        $examQuestionsAnswer = ExamQuestionsAnswer::findOrFail($examQuestionsAnswer->id);
        $examQuestionsAnswer->delete();
        return redirect()->route('exam-questions-answers.index')->with(['success' => 'ExamQuestionsAnswer ' . __("messages.delete")]);
    }
}
