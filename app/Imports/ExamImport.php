<?php

namespace App\Imports;

use App\Models\Exam;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ExamImport implements ToModel, WithHeadingRow
{
    /**
     * @param array $row
     * @return Exam
     */
    public function model(array $row): Exam
    {
        return new Exam([
            'type'    => $row['type'],
            'questions' => $row['questions'],
            'class_id' => $row['class_id'],
        ]);
    }

    public function headingRow(): int
    {
        return 1;
    }
}
