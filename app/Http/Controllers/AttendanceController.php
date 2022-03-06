<?php

namespace App\Http\Controllers;

use App\Models\ExamAttendance;
use App\Models\Student;
use Illuminate\Support\Facades\Validator;

use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
    {
        $inputs = $request->all();
        $student_attendance = ExamAttendance::where('student_id' ,$inputs['student_id'])->first();
        if ($student_attendance == null) {
            $inputs['in_hall'] = 1;
            $student_attendance = ExamAttendance::create($inputs);
        }
        $student = Student::findOrFail($inputs['student_id']);
        return view('admin.components.attendance.view', compact('student' , 'student_attendance'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    public function alhanAttendance(Request $request)
    {
        $inputs = $request->all();
        unset($inputs['token']);
        $student_attendance = ExamAttendance::where('student_id' ,$inputs['student_id'])->first();
        $student_attendance->alhan = 1;
        $student_attendance->save();
        return true;
    }

    public function copticAttendance(Request $request)
    {
        $inputs = $request->all();
        unset($inputs['token']);
        $student_attendance = ExamAttendance::where('student_id' ,$inputs['student_id'])->first();
        $student_attendance->coptic = 1;
        $student_attendance->save();
        return true;
    }

    public function taksAttendance(Request $request)
    {
        $inputs = $request->all();
        unset($inputs['token']);
        $student_attendance = ExamAttendance::where('student_id' ,$inputs['student_id'])->first();
        $student_attendance->taks = 1;
        $student_attendance->save();
        return true;
    }


    public function exitAttendance(Request $request)
    {
        $inputs = $request->all();
        unset($inputs['token']);
        $student_attendance = ExamAttendance::where('student_id' ,$inputs['student_id'])->first();
        if ($student_attendance->alhan == 1 && $student_attendance->coptic == 1 && $student_attendance->taks == 1) {
            $student_attendance->out_hall = 1;
            $student_attendance->save();
            return true;
        }
        else
            return false;
    }
}
