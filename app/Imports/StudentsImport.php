<?php

namespace App\Imports;

use App\Models\Student;
use Illuminate\Database\Eloquent\Model;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class StudentsImport implements ToModel, WithHeadingRow
{
    /**
     * @param array $row
     * @return Student
     */
    public function model(array $row): Student
    {
        return new Student([
            'id'     => $row['id'],
            'name'    => $row['name'],
            'group_number' => $row['group_number'],
            'class_id' => $row['class_id'],
        ]);
    }

    public function headingRow(): int
    {
        return 1;
    }
}
