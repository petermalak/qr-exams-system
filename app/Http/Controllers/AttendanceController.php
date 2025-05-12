<?php

namespace App\Http\Controllers;

use App\DataTables\AgbeyaExamAttendancesDataTable;
use App\DataTables\AlhanExamAttendancesDataTable;
use App\DataTables\CopticExamAttendancesDataTable;
use App\DataTables\TaksExamAttendancesDataTable;
use App\Imports\ExamAttendanceImport;
use App\Models\Booking\BookingExams;
use App\Models\Booking\BookingStudents;
use App\Models\ExamAttendance;
use App\Models\Student;
use App\Services\AttendanceService;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\View\Factory;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Validator;

use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class AttendanceController extends Controller
{

    public function upload_file()
    {
        return view('admin.components.attendance.import');
    }

    public function import_exmas(Request $request): RedirectResponse
    {
        $input = $request->all();
        $validator = Validator::make($input, ['file' => 'required']);
        if ($validator->fails()) {
            return redirect()->route('import-attendance-view')->withErrors($validator)->withInput();
        }
        Excel::import(new ExamAttendanceImport, $request->file('file'));
        return redirect()->route('import-attendance-view')->with(['success' => 'Exams Added Successfully']);
    }


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
    public function agbeya_index(AgbeyaExamAttendancesDataTable $dataTable)
    {
        return $dataTable->render('admin.components.attendance.agbeya_table');
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
        $student = Student::findOrFail($inputs['student_id']);
        $student_attendance = ExamAttendance::where('student_id', $inputs['student_id'])->first(); // Prevent multiple entries by checking if a record already exists
        // if ($student_attendance && ($inputs['prefix'] == 'door-entrance' || $inputs['prefix'] == '/door-entrance')) {
        //     return response()->json(['error' => 'Attendance already recorded for this student'], 403);
        // }
        if ($student_attendance == null && ($inputs['prefix'] == 'door-entrance' || $inputs['prefix'] == '/door-entrance')) {
            $inputs['in_hall'] = 1;
            $student_attendance = ExamAttendance::create($inputs);
        } elseif ($student_attendance != null && ($inputs['prefix'] == 'door-entrance' || $inputs['prefix'] == '/door-entrance')) {
            $student_attendance->in_hall = 1;
            $student_attendance->save();
        }

        if ($student_attendance != null && $inputs['prefix'] != 'door-entrance') {


            ///    Make sure that the out hall equal zero at any case
            $student_attendance = ExamAttendance::where('student_id', $inputs['student_id'])->first();
            $student_attendance->out_hall = 0;
            $student_attendance->save();

            $booking_student = BookingStudents::where('name', $student->name)
                ->first()
                ->bookingExams()
                ->get(['type', 'date']);

            if ($booking_student != null && $student_attendance != null) {
                foreach ($booking_student as $exam) {
                    switch ($exam->type) {
                        case 'alhan':
                            $student_attendance->alhan == 1 ? $student_attendance->alhan = 'Examed ' . $exam->date : $student_attendance->alhan = $exam->date;
                            break;
                        case 'coptic':
                            $student_attendance->coptic == 1 ? $student_attendance->coptic = 'Examed ' . $exam->date : $student_attendance->coptic = $exam->date;
                            break;
                        case 'taks':
                            $student_attendance->taks == 1 ? $student_attendance->taks = 'Examed ' . $exam->date : $student_attendance->taks =  $exam->date;
                            break;
                        case 'agbia':
                            $student_attendance->agbeya == 1 ? $student_attendance->agbeya = 'Examed ' . $exam->date : $student_attendance->agbeya = $exam->date;
                            break;
                    }
                }
            }

            if ($inputs['prefix'] == 'alhan' || $inputs['prefix'] == '/alhan') {
                $response = $this->alhanAttendance($inputs['stud    ent_id']);
                if ($response) {
                    // $student_attendance = ExamAttendance::where('student_id', $inputs['student_id'])->first();
                    return response()->json([
                        'student' => $student,
                        'student_attendance' => $student_attendance
                    ], 200);
                }
            } elseif ($inputs['prefix'] == 'coptic' || $inputs['prefix'] == '/coptic') {
                $response = $this->copticAttendance($inputs['student_id']);
                if ($response) {
                    // $student_attendance = ExamAttendance::where('student_id', $inputs['student_id'])->first();
                    return response()->json([
                        'student' => $student,
                        'student_attendance' => $student_attendance
                    ], 200);
                }
            } elseif ($inputs['prefix'] == 'taks' || $inputs['prefix'] == '/taks') {
                $response = $this->taksAttendance($inputs['student_id']);
                if ($response) {
                    // $student_attendance = ExamAttendance::where('student_id', $inputs['student_id'])->first();
                    return response()->json([
                        'student' => $student,
                        'student_attendance' => $student_attendance
                    ], 200);
                }
            } elseif ($inputs['prefix'] == 'agbeya' || $inputs['prefix'] == '/agbeya') {
                $response = $this->agbeyaAttendance($inputs['student_id']);
                if ($response) {
                    // $student_attendasnce = ExamAttendance::where('student_id', $inputs['student_id'])->first();
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
                $response = $this->exitAttendance($student);
                if ($response) {
                    // $student_attendance = ExamAttendance::where('student_id', $inputs['student_id'])->first();
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
        $student = Student::find($student_id);
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

    public function agbeyaAttendance($student_id): bool
    {
        $student_attendance = ExamAttendance::where('student_id', $student_id)->first();
        $student_attendance->agbeya = 1;
        $student_attendance->save();
        return true;
    }


    public function exitAttendance(Student $student): bool
    {
        $today = date('Y-m-d');
        $student_booking = BookingExams::where('name', $student->name)->get();
        $student_attendance = ExamAttendance::where('student_id', $student->id)->first();


        $flag = true;

        foreach ($student_booking as $exam) {
            switch ($exam->type) {
                case 'alhan':
                    if (AttendanceService::parseArabicDate($exam->date)->format('Y-m-d') == $today && !$student_attendance->alhan)
                        return false;
                    break;
                case 'coptic':
                    if (AttendanceService::parseArabicDate($exam->date)->format('Y-m-d') == $today && !$student_attendance->coptic)
                        return false;
                    break;
                case 'taks':
                    if (AttendanceService::parseArabicDate($exam->date)->format('Y-m-d') == $today && !$student_attendance->taks)
                        return false;
                    break;
                case 'agbia':
                    if (AttendanceService::parseArabicDate($exam->date)->format('Y-m-d') == $today && !$student_attendance->agbeya)
                        return false;
                    break;
            }
        }

        $student_attendance->in_hall = 0;
        $student_attendance->out_hall = 1;
        $student_attendance->save();
        return $flag;
    }
}
