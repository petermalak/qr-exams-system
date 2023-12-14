<?php

namespace App\Imports;

use App\Models\Question;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class QuestionImport implements ToModel, WithHeadingRow
{
    /**
     * @param array $row
     * @return Question
     */
    public function model(array $row): Question
    {
        return new Question([
            'question'    => $row['question'],
            'wight' => $row['wight'],
            'answers' => $row['answers'],
            'written_exam_id' => $row['written_exam_id'],
        ]);
    }

    public function headingRow(): int
    {
        return 1;
    }
}
