<?php

namespace App\Http\Controllers\Admin;

use App\DataTables\BookingExamsDataTable;
use App\Http\Controllers\Controller;
use App\Models\Booking\BookingExams;
use App\Models\ExamAttendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BookingExamController extends Controller
{

    public function index(BookingExamsDataTable $dataTable)
    {
        return $dataTable->render('admin.dashboard.components.booking-exam.index');
    }

    public function create()
    {
        $bookingExam = new BookingExams();
        return view('admin.dashboard.components.booking-exam.create', compact('bookingExam'));
    }

    public function store(Request $request)
    {
        $inputs = $request->all();
        $validator = Validator::make($inputs, BookingExams::$cast);
        if ($validator->fails()) {
            return redirect()->route('booking-exams.create')->withErrors($validator)->withInput();
        }
        BookingExams::create($inputs);
        return redirect()->route('booking-exams.index')->with(['success' => 'Booking Exams ' . __("messages.add")]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\ExamAttendance  $ExamAttendance
     * @return \Illuminate\Http\Response
     */
    public function show(BookingExams $ExamAttendance)
    {
        //
    }

    public function edit(BookingExams $ExamAnswer)
    {
        $examAnswer = BookingExams::findOrFail($ExamAnswer->id);
        $decodedAnswers = json_decode($examAnswer->answers, true);
        return view('admin.dashboard.components.exam-answer.edit', compact('examAnswer', 'decodedAnswers'));
    }

    public function update(Request $request, BookingExams $ExamAnswer)
    {
        $inputs = $request->all();
        $validator = Validator::make($inputs, BookingExams::$cast);
        if ($validator->fails()) {
            return redirect()->route('exam-answers.edit')->withErrors($validator)->withInput();
        }
        $ExamAnswer = BookingExams::findOrFail($ExamAnswer->id);
        $ExamAnswer->update($inputs);
        $ExamAnswer->save();
        return redirect()->route('exam-answers.index')->with(['success' => 'ExamAnswer ' . __("messages.update")]);
    }

    public function destroy(BookingExams $ExamAnswer)
    {
        $ExamAnswer = BookingExams::findOrFail($ExamAnswer->id);
        $ExamAnswer->delete();
        return redirect()->route('exam-answers.index')->with(['success' => 'ExamAnswer ' . __("messages.delete")]);
    }
}
