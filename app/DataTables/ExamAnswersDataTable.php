<?php

namespace App\DataTables;

use App\Models\ExamAnswer;
use Yajra\DataTables\Html\Button;
use Yajra\DataTables\Html\Column;
use Yajra\DataTables\Services\DataTable;

class ExamAnswersDataTable extends DataTable
{
    public function dataTable($query)
    {
        return datatables()
            ->eloquent($query)
            ->addColumn('total_score', function ($examAnswer) {
                $parsedAnswers = json_decode($examAnswer->answers, true);
                $totalScore = 0;

                foreach ($parsedAnswers as $answer) {
                    if (isset($answer['score'])) {
                        $totalScore += (int) $answer['score'];
                    }
                }

                return $totalScore;
            })
            ->addColumn('total_weight', function ($examAnswer) {
                $parsedAnswers = json_decode($examAnswer->answers, true);
                $totalWeight = 0;

                foreach ($parsedAnswers as $answer) {
                    if (isset($answer['wight'])) {
                        $totalWeight += (int) $answer['wight'];
                    }
                }

                return $totalWeight;
            })
            ->addColumn('action', function ($examAnswer) {
                // return view('admin.dashboard.components.table.actions', [
                //     'page' => 'exam-questions-answer',
                //     'data' => $examAnswer,
                // ]);
                return "a";
            });
    }

    public function query(ExamAnswer $model)
    {
        return $model->newQuery();
    }

    public function html()
    {
        return $this->builder()
            ->setTableId('exam-answers-table')
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
            Column::make('id'),
            Column::make('type'),
            Column::make('examiner'),
            Column::make('student_id'),
            Column::make('total_score')->title('Total Score'),
            Column::make('total_weight')->title('Total Weight'),
            Column::computed('action')
                ->exportable(false)
                ->printable(false)
                ->width(60)
                ->addClass('text-center'),
        ];
    }

    protected function filename()
    {
        return 'ExamAnswers_' . date('YmdHis');
    }
}
