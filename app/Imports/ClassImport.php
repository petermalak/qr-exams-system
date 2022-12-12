<?php

namespace App\Imports;

use App\Models\ClassModel;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ClassImport implements ToModel, WithHeadingRow
{
    /**
     * @param array $row
     * @return ClassModel
     */
    public function model(array $row): ClassModel
    {
        return new ClassModel([
            'id'     => $row['id'],
            'name'     => $row['name'],
            'alhan_level'    => $row['alhan_level'],
            'coptic_level' => $row['coptic_level'],
            'taks_level' => $row['taks_level']
        ]);
    }

    public function headingRow(): int
    {
        return 1;
    }
}
