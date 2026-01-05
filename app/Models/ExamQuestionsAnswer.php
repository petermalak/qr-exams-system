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

    public static $cast = [
        'examiner' => 'required',
        'wight' => 'required',
        'score' => 'required',
        'question_id' => 'required',
        'student_id' => 'required',
        'type' => 'required'
    ];
}
