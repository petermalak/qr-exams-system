<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExamAttendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AttendanceController extends Controller
{

    public function index()
    {
        $examAttendances  = ExamAttendance::paginate(10);
        return view('admin.dashboard.components.exam-attendance.index', compact('examAttendances'));
    }

    public function create()
    {
        $examAttendance = new ExamAttendance();
        return view('admin.dashboard.components.exam-attendance.create', compact('examAttendance'));
    }

    public function store(Request $request)
    {
        $inputs = $request->all();
        $validator = Validator::make($inputs, ExamAttendance::$cast);
        if ($validator->fails()) {
            return redirect()->route('exam-attendances.create')->withErrors($validator)->withInput();
        }
        ExamAttendance::create($inputs);
        return redirect()->route('exam-attendances.index')->with(['success' => 'ExamAttendance ' . __("messages.add")]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\ExamAttendance  $ExamAttendance
     * @return \Illuminate\Http\Response
     */
    public function show(ExamAttendance $ExamAttendance)
    {
        //
    }

    public function edit(ExamAttendance $ExamAttendance)
    {
        $examAttendance = ExamAttendance::findOrFail($ExamAttendance->id);
        return view('admin.dashboard.components.exam-attendance.edit', compact('examAttendance'));
    }

    public function update(Request $request, ExamAttendance $ExamAttendance)
    {
        $inputs = $request->all();
        $validator = Validator::make($inputs, ExamAttendance::$cast);
        if ($validator->fails()) {
            return redirect()->route('exam-attendances.edit')->withErrors($validator)->withInput();
        }
        $ExamAttendance = ExamAttendance::findOrFail($ExamAttendance->id);
        $ExamAttendance->update($inputs);
        $ExamAttendance->save();
        return redirect()->route('exam-attendances.index')->with(['success' => 'ExamAttendance ' . __("messages.update")]);
    }

    public function destroy(ExamAttendance $ExamAttendance)
    {
        $ExamAttendance = ExamAttendance::findOrFail($ExamAttendance->id);
        $ExamAttendance->delete();
        return redirect()->route('exam-attendances.index')->with(['success' => 'ExamAttendance ' . __("messages.delete")]);
    }
}
