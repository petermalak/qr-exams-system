<?php

namespace App\Imports;

use App\Models\ExamAttendance;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ExamAttendanceImport implements ToModel, WithHeadingRow
{
    public function model(array $row): ExamAttendance
    {
        return new ExamAttendance([
            'in_hall' => $row['in_hall'],
            'alhan' => $row['alhan'],
            'coptic' => $row['coptic'],
            'taks' => $row['taks'],
            'agbeya' => $row['agbeya'],
            'out_hall' => $row['out_hall'],
            'student_id' => $row['student_id'],

        ]);
    }

    public function headingRow(): int
    {
        return 1;
    }
}
