<?php

namespace App\Exports;

use App\Models\ExamAttendance;
use App\Models\Student;
use Cassandra\Exception\Authentication\Exception;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Database\Query\Builder;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\FromCollection;

class ExamAttendanceExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return ExamAttendance::all();
    }

    public function map($row): array
    {
        return [
            $row->student_id,
            Student::find($row->student_id)->name,
            $row->in_hall ? '1' : '0',
            $row->alhan  ? '1' : '0',
            $row->coptic ? '1' : '0',
            $row->taks  ? '1' : '0',
            $row->out_hall ? '1' : '0',
            $row->created_at,
        ];
    }

    public function headings(): array
    {
        return ['Student ID', 'Name', 'In Hall','Alhan','Coptic','Taks','Out Hall'];
    }

    public function query()
    {
    }
}
