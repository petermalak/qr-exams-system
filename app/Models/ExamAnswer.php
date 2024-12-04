<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamAnswer extends Model
{
    use HasFactory;
    protected $table = 'exams_answers';
    protected $fillable = ['type', 'examiner', 'answers', 'student_id'];

    public static $cast = [
        'type' => 'required',
        'examiner' => 'required',
        'answers' => 'required',
        'student_id' => 'required',
    ];

    // Define the relationship to the Student model
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
