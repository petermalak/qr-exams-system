<?php

namespace App\Http\Controllers;

use App\Imports\StudentsImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class StudentController extends Controller
{
   public function import_students(Request $request){
       dd($request->hasFile('students'));
    $students = Excel::import(new StudentsImport, $request->file('students'));
    dd($students);
   }
}
