<?php

namespace App\Exports;

use App\Models\ClassModel;
use App\Models\ExamAnswer;
use App\Models\Student;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ExamAnswersExport implements FromCollection,WithMapping
{
    public function collection()
    {
        return ExamAnswer::all();
    }

    public function map($row): array
    {
        $answers = json_decode($row->answers, true);
        $student = Student::find($row->student_id);
        $class = ClassModel::find($student->class_id);
        $rowData = [
            $row->student_id,
            $row->type,
            $student->name,
            $class->name,
            $row->examiner,
        ];

        foreach ($answers as $value) {
            $rowData[] = $value['score'];
        }

        return $rowData;
    }
    public function query()
    {
    }
}
