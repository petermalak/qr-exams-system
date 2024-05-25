<?php

namespace App\DataTables;

use App\Models\ClassModel;
use App\Models\ExamAnswer;
use App\Models\ExamQuestionsAnswer;
use App\Models\Student;
use Yajra\DataTables\DataTableAbstract;
use Yajra\DataTables\Html\Button;
use Yajra\DataTables\Html\Column;
use Yajra\DataTables\Services\DataTable;
use Illuminate\Support\Collection;

class ScoreViewDataTable extends DataTable
{
    /**
     * Build DataTable class.
     *
     * @param mixed $query Results from query() method.
     * @return DataTableAbstract
     */
    public function dataTable($query): DataTableAbstract
    {
        return datatables()
            ->collection($query)
            ->addColumn('student_name', function ($data) {
                return $data['student_name'];
            })
            ->addColumn('group_number', function ($data) {
                return $data['group_number'];
            })
            ->addColumn('alhan', function ($data) {
                return $data['alhan'] !== null ? $data['alhan'] : 'Not Examed';
            })
            ->addColumn('taks', function ($data) {
                return $data['taks'] !== null ? $data['taks'] : 'Not Examed';
            })
            ->addColumn('coptic', function ($data) {
                return $data['coptic'] !== null ? $data['coptic'] : 'Not Examed';
            })
            ->addColumn('agbeya', function ($data) {
                return $data['agbeya'] !== null ? $data['agbeya'] : 'Not Examed';
            });
    }


    /**
     * Get query source of dataTable.
     *
     * @return Collection
     */
    public function query(): Collection
    {
        $examAnswers = ExamAnswer::with('student')->get();
        $examQuestionsAnswers = ExamQuestionsAnswer::all()->groupBy(['student_id', 'type']);

        $examData = [];

        // Process data from the exam_answers table ( امتحنات الشفوى )
        foreach ($examAnswers as $exam) {
            if (is_string($exam->answers)) {
                $answers = json_decode($exam->answers, true);
            } else {
                $answers = $exam->answers;
            }

            $totalWeight = 0;
            $totalScore = 0;

            foreach ($answers as $key => $value) {
                if (isset($value['wight']) && isset($value['score'])) {
                    $totalWeight += $value['wight'];
                    $totalScore += $value['score'];
                }
            }

            $percentage = $totalWeight ? round(($totalScore / $totalWeight) * 100, 2) : 0;

            $studentId = $exam->student_id;

            $student = Student::find($studentId);
            $class = ClassModel::find($student->class_id);

            $studentName = $student->name;
            $groupNumber = $class->name;
            $subject = $exam->type;
            if (!isset($examData[$studentId])) {
                $examData[$studentId] = [
                    'student_name' => $studentName,
                    'std_id' => $studentId,
                    'group_number' => $groupNumber,
                    'alhan' => null,
                    'taks' => null,
                    'coptic' => null,
                    'agbeya' => null,
                ];
            }

            $examData[$studentId][$subject] = $percentage;
        }



        // Process data from the examQuestionsAnswers table ( امتحنات التحريري )

        // Process data from the exam_questions_answers table
        foreach ($examQuestionsAnswers as $studentId => $subjects) {
            foreach ($subjects as $subject => $subjectAnswers) {
                // Calculate total score and total weight for the subject
                $totalScore = $subjectAnswers->sum('score');
                $totalWeight = $subjectAnswers->sum('wight');

                // Calculate percentage
                $percentage = $totalWeight > 0 ? round(($totalScore / $totalWeight) * 100, 2) : 0;


                $student_id = $subjectAnswers->first()->student_id;
                $student = Student::find($student_id);
                $class = ClassModel::find($student->class_id);
                // Store the data in the examData array
                $studentName = $student->name; // Assuming all entries have the same examiner
                $groupNumber = $class->name; // Assuming all entries have the same group number

                if (!isset($examData[$studentId])) {
                    $examData[$studentId] = [
                        'student_name' => $studentName,
                        'std_id' => $studentId,
                        'group_number' => $groupNumber,
                        'alhan' => null,
                        'taks' => null,
                        'coptic' => null,
                        'agbeya' => null,
                    ];
                }

                if (!isset($examData[$studentId][$subject])) {
                    $examData[$studentId][$subject] = 0;
                }

                // Sum the percentages
                $examData[$studentId][$subject] += $percentage;
            }
        }

        // foreach ($examQuestionsAnswers as $question) {
        //     $studentId = $question->student_id;
        //     $subject = $question->type;

        //     if (!isset($examData[$studentId])) {
        //         $student = Student::find($studentId);
        //         $class = ClassModel::find($student->class_id);
        //         $examData[$studentId] = [
        //             'student_name' => $student->name,
        //             'std_id' => $studentId,
        //             'group_number' => $class->name,
        //             'alhan' => null,
        //             'taks' => null,
        //             'coptic' => null,
        //             'agbeya' => null,
        //         ];
        //     }

        //     $totalScore = $question->score;
        //     $totalWeight = $question->wight;
        //     $percentage = $totalWeight ? ($totalScore / $totalWeight) * 100 : 0;

        //     if (!isset($examData[$studentId][$subject])) {
        //         $examData[$studentId][$subject] = 0;
        //     }

        //     $examData[$studentId][$subject] += $percentage;
        // }
        return collect($examData);
    }

    /**
     * Optional method if you want to use html builder.
     *
     * @return \Yajra\DataTables\Html\Builder
     */
    public function html(): \Yajra\DataTables\Html\Builder
    {
        return $this->builder()
            ->setTableId('examanswerviewdatatable-table')
            ->columns($this->getColumns())
            ->minifiedAjax()
            ->dom('Blfrtip')
            ->orderBy(1)
            ->buttons(
                Button::make('export'),
                Button::make('print'),
                Button::make('reset'),
                Button::make('reload')
            );
    }

    /**
     * Get columns.
     *
     * @return array
     */
    protected function getColumns(): array
    {
        return [
            Column::make('student_name')->title('Student Name'),
            Column::make('std_id')->title('Student ID'),
            Column::make('group_number')->title('Group Number'),
            Column::make('alhan')->title('Alhan'),
            Column::make('taks')->title('Taks'),
            Column::make('coptic')->title('Coptic'),
            Column::make('agbeya')->title('Agbeya'),
        ];
    }

    /**
     * Get filename for export.
     *
     * @return string
     */
    protected function filename(): string
    {
        return 'ScoreView_' . date('YmdHis');
    }
}
