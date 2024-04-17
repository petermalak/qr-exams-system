<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use App\Models\ClassModel;
use App\Models\ExamAnswer;
use App\Models\Student;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
class CopticExamAnswersValues implements FromCollection, WithMapping
{
    public function collection()
    {
        return ExamAnswer::where('type', 'coptic')->get();
    }

    public function map($row): array
    {
        $answers = json_decode($row->answers, true);
        $student = Student::find($row->student_id);
        $class = ClassModel::find($student->class_id);
        $result = 0;
        $exam_wight = 0;
        foreach ($answers as $value) {
            $exam_wight += isset($value['wight']) ? $value['wight'] : 0;
            $result += isset($value['score']) ? $value['score'] : 0;
        }

        $rowData = [
            $row->student_id,
            $row->type,
            $student->name,
            $class->name,
            $row->examiner,
            $exam_wight,
            $result,
            $row->created_at
        ];
        return $rowData;
    }

    public function headings(): array
    {
        // Define your column headers here
        return [
            'Student ID',
            'Type',
            'Student Name',
            'Class Name',
            'Examiner',
            'Exam Weight',
            'Result',
            'Created At'
        ];
    }
    public function query()
    {
    }
}
