<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamAttendance extends Model
{
    use HasFactory;
    protected $table = 'exam_attendance';
    protected $fillable = [
        'in_hall',
        'alhan',
        'coptic',
        'taks',
        'agbeya',
        'out_hall',
        'student_id'
    ];

    public static $cast = [
        'in_hall' => 'required',
        'alhan' => 'required',
        'coptic' => 'required',
        'taks' => 'required',
        'agbeya' => 'required',
        'out_hall' => 'required',
        'student_id' => 'required',
    ];
}
