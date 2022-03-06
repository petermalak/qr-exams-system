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
        'out_hall',
        'student_id'
    ];
}
