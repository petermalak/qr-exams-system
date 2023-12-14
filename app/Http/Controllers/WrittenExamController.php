<?php

namespace App\Http\Controllers;

use App\Imports\WrittenExamImport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;

class WrittenExamController extends Controller
{
    public function upload_file()
    {
        return view('admin.components.writtenExams.import');
    }

    public function import_exmas(Request $request): RedirectResponse
    {
        $input = $request->all();
        $validator = Validator::make($input, ['file' => 'required']);
        if ($validator->fails()) {
            return redirect()->route('import-written-exams-view')->withErrors($validator)->withInput();
        }
        Excel::import(new WrittenExamImport, $request->file('file'));
        return redirect()->route('import-written-exams-view')->with(['success' => 'Exams Added Successfully']);
    }
}
