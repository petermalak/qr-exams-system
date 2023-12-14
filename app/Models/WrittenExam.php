<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WrittenExam extends Model
{
    use HasFactory;
    protected $table = 'written_exams';
    protected $fillable = [
        'id',
        'type',
        'class_id'
    ];
}
