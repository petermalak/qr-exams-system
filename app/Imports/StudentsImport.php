<?php

namespace App\Imports;

use App\Models\Student;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class StudentsImport implements ToModel, WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        return new Student([
            'id'     => $row['id'],
            'name'    => $row['name'],
            'group_number' => $row['group_number']
        ]);
    }

    public function headingRow(): int
    {
        return 0;
    }
}
