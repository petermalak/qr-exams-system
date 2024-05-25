<?php

namespace App\Exports;

use App\Models\ClassModel;
use App\Models\ExamAnswer;
use App\Models\Student;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ExamAnswersExport implements FromCollection, WithMapping, WithHeadings
{
    public function collection()
    {
        return ExamAnswer::where('type', 'alhan')->get();
    }

    public function map($row): array
    {
        $answers = json_decode($row->answers, true);
        $student = Student::find($row->student_id);
        $class = ClassModel::find($student->class_id);
        $rowData = [
            $row->student_id,
            $student->name,
            $class->name,
            $row->examiner,
            $row->created_at,
        ];

        foreach ($answers as $value) {
            if(isset($value['wight'])){
                $rowData[] = isset($value['original-question']) ? $value['original-question'] : '';
                $rowData[] = $value['wight'];
                $rowData[] = $value['score'];
            }
        }

        return $rowData;
    }

    public function headings(): array
    {
        // Define your column headers here
        $headers = [
            'Student ID',
            'Student Name',
            'Class Name',
            'Examiner',
            'Created At'
        ];

        // Add headers for each answer
        foreach (json_decode(ExamAnswer::first()->answers, true) as $value) {
            $headers[] = 'Question';
            $headers[] = 'Weight';
            $headers[] = 'Score';
        }

        return $headers;
    }
    public function query()
    {
    }
}
