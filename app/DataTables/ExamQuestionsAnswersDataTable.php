<?php

namespace App\DataTables;

use App\Models\ExamQuestionsAnswer;
use App\Models\Question;
use App\Models\Student;
use Yajra\DataTables\Html\Button;
use Yajra\DataTables\Html\Column;
use Yajra\DataTables\Services\DataTable;

class ExamQuestionsAnswersDataTable extends DataTable
{
    public function dataTable($query)
    {
        return datatables()
            ->eloquent($query)
            ->addColumn('student_name', function ($data) {
                $student = Student::find($data->student_id);
                return $student ? $student->name : 'Unknown';
            })
            ->addColumn('type', function ($data) {
                return $data->type;
            })
            ->addColumn('total_score', function ($data) {
                return $data->total_score;
            })
            ->addColumn('total_weight', function ($data) {
                return $data->total_weight;
            })
            ->addColumn('percentage', function ($data) {
                return $data->total_weight ? round(($data->total_score / $data->total_weight) * 100, 2) . '%' : '0%';
            })
            ->addColumn('examiner', function ($data) {
                return $data->examiner; // Adding the examiner column
            })
            ->addColumn('oral_translation_score', function ($data) {
                if ($data->type === 'coptic' &&
                    $data->oral_translation_score !== null &&
                    $data->oral_translation_weight !== null) {
                    return $data->oral_translation_score . ' / ' . $data->oral_translation_weight;
                }
                return '';
            })
            ->addColumn('action', function ($data) {
                return "aaaa";
            });
    }

    public function query(ExamQuestionsAnswer $model)
    {
        // Get the question ID for "شفوى و ترجمة" question
        $oralTranslationQuestionId = Question::where('question', 'like', '%شفوى و ترجمة%')
            ->value('id');

        // If question not found, use 0 to ensure no matches
        if (!$oralTranslationQuestionId) {
            $oralTranslationQuestionId = 0;
        }

        $query = $model->newQuery()
            ->selectRaw('
                student_id,
                examiner,
                type,
                SUM(score) as total_score,
                SUM(wight) as total_weight,
                MAX(CASE
                    WHEN type = ? AND question_id = ?
                    THEN CAST(score AS DECIMAL(10,2))
                    ELSE NULL
                END) as oral_translation_score,
                MAX(CASE
                    WHEN type = ? AND question_id = ?
                    THEN CAST(wight AS DECIMAL(10,2))
                    ELSE NULL
                END) as oral_translation_weight
            ', [
                'coptic', $oralTranslationQuestionId,
                'coptic', $oralTranslationQuestionId
            ])
            ->groupBy('student_id', 'examiner', 'type'); // Grouping by examiner as well

        return $query;
    }

    public function html()
    {
        return $this->builder()
            ->setTableId('exam-questions-answers-table')
            ->columns($this->getColumns())
            ->minifiedAjax()
            ->dom('Blfrtip')
            ->lengthMenu([[100, 200, 500, -1], [100, 200, 500, 'Show All']])
            ->orderBy(1)
            ->buttons(
                Button::make('create'),
                Button::make('export'),
                Button::make('print'),
                Button::make('reset'),
                Button::make('reload')
            );
    }

    protected function getColumns()
    {
        return [
            Column::make('examiner')->title('Examiner Name'), // Adding examiner column
            Column::make('student_id')->title('Student ID'),
            Column::make('student_name')->title('Student Name'),
            Column::make('type')->title('Exam Type'),
            Column::make('total_score')->title('Total Score'),
            Column::make('total_weight')->title('Total Weight'),
            Column::make('percentage')->title('Percentage'),
            Column::make('oral_translation_score')->title('شفوى و ترجمة (Score / Weight)'),
            Column::computed('action')
                ->exportable(false)
                ->printable(false)
                ->width(60)
                ->addClass('text-center'),
        ];
    }

    protected function filename()
    {
        return 'ExamQuestionsAnswers_' . date('YmdHis');
    }
}
