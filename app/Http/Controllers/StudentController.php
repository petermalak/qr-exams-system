<?php

namespace App\Http\Controllers;

use App\Exports\ExamAnswersExport;
use App\Exports\ExamAttendanceExport;
use App\Imports\StudentsImport;
use App\Models\ExamAnswer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class StudentController extends Controller
{
    /**
     * Show the form for creating a new resource.
     *
     */
    public function upload_file()
    {
        return view('admin.components.student.import');
    }

   public function import_students(Request $request): RedirectResponse
   {
       $input = $request->all();
       $validator = Validator::make($input, [ 'file' => 'required' ] );
       if ($validator->fails()) {
           return redirect()->route('import-student-view')->withErrors($validator)->withInput();
       }
       Excel::import(new StudentsImport, $request->file('file'));
       return redirect()->route('import-student-view')->with(['success' => 'Students Added Successfully']);
   }

   public function export_exam_attendance()
   {
       return Excel::download(new ExamAttendanceExport(), 'students.xlsx')->sendHeaders();
   }

   public function export_exam_answers()
   {
       return Excel::download(new ExamAnswersExport(), 'answers.xlsx')->sendHeaders();
   }
}
