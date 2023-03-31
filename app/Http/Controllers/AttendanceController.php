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
        $student_attendance = ExamAttendance::where('student_id', $inputs['student_id'])->first();
        if ($student_attendance == null) {
            $inputs['in_hall'] = 1;
            $student_attendance = ExamAttendance::create($inputs);
        }
        $student = Student::findOrFail($inputs['student_id']);
        return view('admin.components.attendance.view', compact('student', 'student_attendance'));
    }

    /**
     *
     * @param Request $request
     */
    public function get_student_exam_data(Request $request)
    {
        $inputs = $request->all();
        $validator = Validator::make($inputs, ['student_id' => 'required', 'prefix' => 'required|string']);
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }
        $student_attendance = ExamAttendance::where('student_id', $inputs['student_id'])->first();
        $student = Student::findOrFail($inputs['student_id']);

        if ($student_attendance == null && ($inputs['prefix'] == 'door-entrance' || $inputs['prefix'] == '/door-entrance') ) {
            $inputs['in_hall'] = 1;
            $student_attendance = ExamAttendance::create($inputs);
        }
        elseif($student_attendance == null && $inputs['prefix'] != 'door-entrance'){
            return response()->json(['error' => 'Go to Entrance first'], 401);
        }

        if ($student_attendance != null && $inputs['prefix'] != 'door-entrance') {


            if ($inputs['prefix'] == 'alhan' || $inputs['prefix'] == '/alhan') {
                $response = $this->alhanAttendance($inputs['student_id']);
                if ($response) {
                    $student_attendance = ExamAttendance::where('student_id', $inputs['student_id'])->first();
                    return response()->json([
                        'student' => $student,
                        'student_attendance' => $student_attendance
                    ], 200);
                }
            } elseif ($inputs['prefix'] == 'coptic' || $inputs['prefix'] == '/coptic') {
                $response = $this->copticAttendance($inputs['student_id']);
                if ($response) {
                    $student_attendance = ExamAttendance::where('student_id', $inputs['student_id'])->first();
                    return response()->json([
                        'student' => $student,
                        'student_attendance' => $student_attendance
                    ], 200);
                }
            } elseif ($inputs['prefix'] == 'taks' || $inputs['prefix'] == '/taks') {
                $response = $this->taksAttendance($inputs['student_id']);
                if ($response) {
                    $student_attendance = ExamAttendance::where('student_id', $inputs['student_id'])->first();
                    return response()->json([
                        'student' => $student,
                        'student_attendance' => $student_attendance
                    ], 200);
                }
            } elseif ($inputs['prefix'] == 'door-entrance' || $inputs['prefix'] == '/door-entrance') {
                return response()->json([
                    'student' => $student,
                    'student_attendance' => $student_attendance
                ], 200);
            } elseif ($inputs['prefix'] == 'door-exit' || $inputs['prefix'] == '/door-exit') {
                $response = $this->exitAttendance($inputs['student_id']);
                if ($response) {
                    $student_attendance = ExamAttendance::where('student_id', $inputs['student_id'])->first();
                    return response()->json([
                        'student' => $student,
                        'student_attendance' => $student_attendance
                    ], 200);
                } else {
                    return response()->json(['error' => 'There is exam missing', 'student' => $student, 'student_attendance' => $student_attendance], 400);
                }
            }
        }


        return response()->json([
            'student' => $student,
            'student_attendance' => $student_attendance
        ], 200);
    }

    public function alhanAttendance($student_id): bool
    {
        $student_attendance = ExamAttendance::where('student_id', $student_id)->first();
        $student_attendance->alhan = 1;
        $student_attendance->save();
        return true;
    }

    public function copticAttendance($student_id): bool
    {
        $student_attendance = ExamAttendance::where('student_id', $student_id)->first();
        $student_attendance->coptic = 1;
        $student_attendance->save();
        return true;
    }

    public function taksAttendance($student_id): bool
    {
        $student_attendance = ExamAttendance::where('student_id', $student_id)->first();
        $student_attendance->taks = 1;
        $student_attendance->save();
        return true;
    }


    public function exitAttendance($student_id): bool
    {
        $student_attendance = ExamAttendance::where('student_id', $student_id)->first();
        if ($student_attendance->alhan == 1 && $student_attendance->coptic == 1 && $student_attendance->taks == 1) {
            $student_attendance->out_hall = 1;
            $student_attendance->save();
            return true;
        } else {
            return false;
        }
    }
}
