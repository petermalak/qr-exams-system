<?php

namespace App\Http\Controllers;

use App\Imports\QuestionImport;
use App\Models\Question;
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

    public function test()
    {
        return view('admin.components.question.test');
    }
    public function import_questions_array(Request $request): RedirectResponse
    {
        $input = $request->all();
        $validator = Validator::make($input, ['array' => 'required']);
        if ($validator->fails()) {
            return redirect()->route('aaa')->withErrors($validator)->withInput();
        }

        $examData = json_decode($request->input('array'), true);

        foreach ($examData as $value) {
            Question::create([
                'question'    => $value['question'],
                'wight' => $value['wight'],
                'answers' => json_encode($value['answers']),
                'written_exam_id' => 10,
            ]);
            Question::create([
                'question'    => $value['question'],
                'wight' => $value['wight'],
                'answers' => json_encode($value['answers']),
                'written_exam_id' => 11,
            ]);
            Question::create([
                'question'    => $value['question'],
                'wight' => $value['wight'],
                'answers' => json_encode($value['answers']),
                'written_exam_id' => 12,
            ]);
        }

        return redirect()->route('aaa')->with(['success' => 'Questions Added Successfully']);
    }
}
