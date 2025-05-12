<?php

namespace App\Models\Booking;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingExams extends Model
{
    protected $connection = 'second_mysql';
    protected $table = 'exams';

    public static $cast = [
        'type' => 'required',
        'examiner' => 'required',
        'answers' => 'required',
        'student_id' => 'required',
    ];
}
