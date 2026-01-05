<?php

namespace App\Http\Controllers\Admin;

use App\DataTables\ExamAnswersDataTable;
use App\Http\Controllers\Controller;
use App\Models\ExamAnswer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ExamAnswerController extends Controller
{

    public function index(ExamAnswersDataTable $dataTable)
    {
        return $dataTable->render('admin.dashboard.components.exam-answer.index');
    }

    public function create()
    {
        $examAnswer = new ExamAnswer();
        return view('admin.dashboard.components.exam-answer.create', compact('examAnswer'));
    }

    public function store(Request $request)
    {
        $inputs = $request->all();
        $validator = Validator::make($inputs, ExamAnswer::$cast);
        if ($validator->fails()) {
            return redirect()->route('exam-answers.create')->withErrors($validator)->withInput();
        }
        ExamAnswer::create($inputs);
        return redirect()->route('exam-answers.index')->with(['success' => 'Exam Answer ' . __("messages.add")]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\ExamAttendance  $ExamAttendance
     * @return \Illuminate\Http\Response
     */
    public function show(ExamAnswer $ExamAttendance)
    {
        //
    }

    public function edit(ExamAnswer $ExamAnswer)
    {
        $examAnswer = ExamAnswer::findOrFail($ExamAnswer->id);
        $decodedAnswers = json_decode($examAnswer->answers, true);
        return view('admin.dashboard.components.exam-answer.edit', compact('examAnswer', 'decodedAnswers'));
    }

    public function update(Request $request, ExamAnswer $ExamAnswer)
    {
        $inputs = $request->all();
        $validator = Validator::make($inputs, ExamAnswer::$cast);
        if ($validator->fails()) {
            return redirect()->route('exam-answers.edit')->withErrors($validator)->withInput();
        }
        $ExamAnswer = ExamAnswer::findOrFail($ExamAnswer->id);
        $ExamAnswer->update($inputs);
        $ExamAnswer->save();
        return redirect()->route('exam-answers.index')->with(['success' => 'ExamAnswer ' . __("messages.update")]);
    }

    public function destroy(ExamAnswer $ExamAnswer)
    {
        $ExamAnswer = ExamAnswer::findOrFail($ExamAnswer->id);
        $ExamAnswer->delete();
        return redirect()->route('exam-answers.index')->with(['success' => 'ExamAnswer ' . __("messages.delete")]);
    }
}
