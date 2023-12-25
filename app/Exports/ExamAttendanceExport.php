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
            $row->in_hall ? 'Examed' : 'Not Examed',
            $row->alhan  ? 'Examed' : 'Not Examed',
            $row->coptic ? 'Examed' : 'Not Examed',
            $row->taks  ? 'Examed' : 'Not Examed',
            $row->out_hall ? 'Examed' : 'Not Examed',
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
