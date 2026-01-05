<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamAttendance extends Model
{
    use HasFactory;

    // Specify the table if it doesn't follow Laravel's naming conventions
    protected $table = 'exam_attendance';

    // Define fillable properties if needed
    protected $fillable = ['student_id', 'alhan', 'coptic', 'taks'];
}
