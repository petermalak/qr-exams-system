<?php

namespace App\Http\Controllers;

use App\DataTables\AlhanExamAttendancesDataTable;
use App\DataTables\CopticExamAttendancesDataTable;
use App\DataTables\TaksExamAttendancesDataTable;
use App\Models\ExamAttendance;
use App\Models\Student;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\View\Factory;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     */
    public function alhan_index(AlhanExamAttendancesDataTable $dataTable)
    {
        return $dataTable->render('admin.components.attendance.alhan_table');
    }

    public function coptic_index(CopticExamAttendancesDataTable $dataTable)
    {
        return $dataTable->render('admin.components.attendance.coptic_table');
    }

    public function taks_index(TaksExamAttendancesDataTable $dataTable)
    {
        return $dataTable->render('admin.components.attendance.taks_table');
    }
    /**
     * Show the form for creating a new resource.
     *
     * @return Application|Factory|View
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
     *
     * @param Request $request
     */
    public function get_student_exam_data(Request $request)
    {
        $inputs = $request->all();
        $validator = Validator::make($inputs, ['student_id' => 'required']);
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }
        $student_attendance = ExamAttendance::where('student_id' ,$inputs['student_id'])->first();
        $student = Student::findOrFail($inputs['student_id']);
        return response()->json([
            'student' => $student,
            'student_attendance' => $student_attendance
        ], 200);
    }

    public function alhanAttendance(Request $request): bool
    {
        $inputs = $request->all();
        unset($inputs['token']);
        $student_attendance = ExamAttendance::where('student_id' ,$inputs['student_id'])->first();
        $student_attendance->alhan = 1;
        $student_attendance->save();
        return true;
    }

    public function copticAttendance(Request $request): bool
    {
        $inputs = $request->all();
        unset($inputs['token']);
        $student_attendance = ExamAttendance::where('student_id' ,$inputs['student_id'])->first();
        $student_attendance->coptic = 1;
        $student_attendance->save();
        return true;
    }

    public function taksAttendance(Request $request): bool
    {
        $inputs = $request->all();
        unset($inputs['token']);
        $student_attendance = ExamAttendance::where('student_id' ,$inputs['student_id'])->first();
        $student_attendance->taks = 1;
        $student_attendance->save();
        return true;
    }


    public function exitAttendance(Request $request): bool
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
