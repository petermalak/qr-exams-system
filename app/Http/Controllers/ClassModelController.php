<?php

namespace App\Http\Controllers;

use App\Imports\ClassImport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;

class ClassModelController extends Controller
{
    /**
     * Show the form for creating a new resource.
     *
     */
    public function upload_file()
    {
        return view('admin.components.class.import');
    }

    public function import_classes(Request $request): RedirectResponse
    {
        $input = $request->all();
        $validator = Validator::make($input, [ 'file' => 'required' ] );
        if ($validator->fails()) {
            return redirect()->route('import-class-view')->withErrors($validator)->withInput();
        }
        Excel::import(new ClassImport, $request->file('file'));
        return redirect()->route('import-class-view')->with(['success' => 'Classes Added Successfully']);
    }

    public function export_classes()
    {
//        return Excel::download(new ExamAttendanceExport(), 'students.xlsx')->sendHeaders();
    }
}
