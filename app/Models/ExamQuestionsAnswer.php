<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamQuestionsAnswer extends Model
{
    use HasFactory;

    protected $table = 'exam_questions_answers';
    protected $fillable = [
        'id',
        'examiner',
        'wight',
        'score',
        'question_id',
        'student_id',
        'type'
    ];
}
