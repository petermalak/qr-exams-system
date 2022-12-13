<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class QrCodesImport implements ToModel, WithHeadingRow
{
    /**
     * @param array $row
     */
    public function model(array $row)
    {
        QrCode::size(256)->generate($row['id'], '../public/sana2/' . $row['id'] . '-' . $row['name'] . '.svg');
        return;
    }

    public function headingRow(): int
    {
        return 1;
    }
}
