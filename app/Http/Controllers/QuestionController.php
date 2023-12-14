<?php

namespace App\Http\Controllers;

use App\Imports\QuestionImport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
class QuestionController extends Controller
{
    public function upload_file()
    {
        return view('admin.components.question.import');
    }

    public function import_questions(Request $request): RedirectResponse
    {
        $input = $request->all();
        $validator = Validator::make($input, ['file' => 'required']);
        if ($validator->fails()) {
            return redirect()->route('import-question-view')->withErrors($validator)->withInput();
        }
        Excel::import(new QuestionImport, $request->file('file'));
        return redirect()->route('import-question-view')->with(['success' => 'Questions Added Successfully']);
    }
}
