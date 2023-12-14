<?php

namespace App\Imports;

use App\Models\WrittenExam;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class WrittenExamImport implements ToModel, WithHeadingRow
{
       /**
     * @param array $row
     * @return WrittenExam
     */
    public function model(array $row): WrittenExam
    {
        return new WrittenExam([
            'id'     => $row['id'],
            'type'    => $row['type'],
            'class_id' => $row['class_id'],
        ]);
    }

    public function headingRow(): int
    {
        return 1;
    }
}
