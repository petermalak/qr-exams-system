<?php

namespace App\Http\Controllers;

use App\Imports\ExamImport;
use App\Imports\QrCodesImport;
use App\Models\Exam;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\ExamAnswer;
use App\Models\ExamAttendance;

class ExamController extends Controller
{
    /**
     * Show the form for creating a new resource.
     *
     */
    public function upload_file()
    {
        return view('admin.components.exam.import');
    }

    public function import_exams(Request $request): RedirectResponse
    {
        $input = $request->all();
        $validator = Validator::make($input, ['file' => 'required']);
        if ($validator->fails()) {
            return redirect()->route('import-exam-view')->withErrors($validator)->withInput();
        }
        Excel::import(new ExamImport, $request->file('file'));
        // Excel::import(new QrCodesImport, $request->file('file'));

        return redirect()->route('import-exam-view')->with(['success' => 'Exams Added Successfully']);
    }

    public function update(Request $request)
    {
        // Assuming you have some logic to handle exam answers

        // Get the submitted data
        $studentId = $request->input('student_id');
        $examType = $request->input('type');

        // Find the corresponding exam attendance record
        $examAttendance = ExamAttendance::where('student_id', $studentId)->first();

        if ($examAttendance) {
            // Update the relevant field based on exam type
            switch ($examType) {
                case 'alhan':
                    $examAttendance->alhan = 1;
                    break;
                case 'coptic':
                    $examAttendance->coptic = 1;
                    break;
                case 'taks':
                    $examAttendance->taks = 1;
                    break;
                case 'agbeya':
                    $examAttendance->taks = 1;
                    break;
            }

            // Save the changes
            $examAttendance->save();
        }

        // Handle other form submission logic (e.g., saving answers)

        // Redirect back with a success message
        return redirect()->back()->with('status', 'Exam submitted successfully!');
    }
}
