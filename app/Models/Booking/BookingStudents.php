<?php

namespace App\Models\Booking;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingStudents extends Model
{
    protected $connection = 'second_mysql';
    protected $table = 'students';

    public function bookingExams()
    {
        return $this->hasMany(BookingExams::class, 'name', 'name');
    }
}
