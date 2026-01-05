<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScoreView extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'student_name', 'std_id', 'group_number', 'alhan', 'taks', 'coptic', 'agbeya'
    ];
}
