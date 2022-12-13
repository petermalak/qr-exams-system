<?php

namespace App\Http\Controllers;

use App\Imports\ExamImport;
use App\Imports\QrCodesImport;
use App\Models\Exam;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;

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
}
