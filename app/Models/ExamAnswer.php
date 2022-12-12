<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamAnswer extends Model
{
    use HasFactory;
    protected $table = 'exams_answers';
    protected $fillable = ['type','examiner','answers','student_id'];
}
