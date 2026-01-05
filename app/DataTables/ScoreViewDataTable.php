<?php

namespace App\DataTables;

use App\Models\ClassModel;
use App\Models\ExamAnswer;
use App\Models\ExamQuestionsAnswer;
use App\Models\Question;
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
            ->rawColumns(['alhan', 'taks', 'coptic', 'agbeya']) // Specify columns that contain HTML
            ->addColumn('student_name', function ($data) {
                return $data['student_name'];
            })
            ->addColumn('group_number', function ($data) {
                return $data['group_number'];
            })
            ->addColumn('alhan', function ($data) {
                return $this->styleColumn($data['alhan'], 'alhan');
            })
            ->addColumn('alhan_score', function ($data) {
                return $data['alhan_score'];
            })
            ->addColumn('alhan_weight', function ($data) {
                return $data['alhan_weight'];
            })
            ->addColumn('taks', function ($data) {
                return $this->styleColumn($data['taks'], 'taks');
            })
            ->addColumn('taks_score', function ($data) {
                return $data['taks_score'];
            })
            ->addColumn('taks_weight', function ($data) {
                return $data['taks_weight'];
            })
            ->addColumn('coptic', function ($data) {
                return $this->styleColumn($data['coptic'], 'coptic');
            })
            ->addColumn('coptic_score', function ($data) {
                return $data['coptic_score'];
            })
            ->addColumn('coptic_weight', function ($data) {
                return $data['coptic_weight'];
            })
            ->addColumn('coptic_oral_translation', function ($data) {
                if (isset($data['coptic_oral_translation_score']) &&
                    isset($data['coptic_oral_translation_weight']) &&
                    $data['coptic_oral_translation_score'] !== null &&
                    $data['coptic_oral_translation_weight'] !== null) {
                    return $data['coptic_oral_translation_score'] . ' / ' . $data['coptic_oral_translation_weight'];
                }
                return '';
            })
            ->addColumn('agbeya', function ($data) {
                return $this->styleColumn($data['agbeya'], 'agbeya');
            })
            ->addColumn('agbeya_score', function ($data) {
                return $data['agbeya_score'];
            })
            ->addColumn('agbeya_weight', function ($data) {
                return $data['agbeya_weight'];
            });
    }


    /**
     * Apply styles to columns based on their values.
     *
     * @param mixed $value
     * @param string $column
     * @return string
     */
    protected function styleColumn($value, $column)
    {
        if ($value === null) {
            return '<span style="color: red;">Not Examed</span>';
        }

        $color = 'black';
        if ($value >= 85) {
            $color = 'green';
        } elseif ($value >= 75) {
            $color = 'blue';
        } elseif ($value >= 65) {
            $color = 'yellow';
        } elseif ($value >= 50) {
            $color = 'orange';
        } elseif ($value < 50) {
            $color = 'red';
        } else {
            $color = 'black';
        }

        return '<span style="color: ' . $color . ';">' . number_format($value, 2) . '%</span>';
    }

    /**
     * Get query source of dataTable.
     *
     * @return Collection
     */
    public function query(): Collection
    {
        // Get the question ID for "شفوى و ترجمة" question
        // Try multiple variations to ensure we find it
        $oralTranslationQuestionId = Question::where(function($query) {
                $query->where('question', 'like', '%شفوى و ترجمة%')
                      ->orWhere('question', 'like', '%شفوي و ترجمة%')
                      ->orWhere('question', 'like', '%شفوى%ترجمة%')
                      ->orWhere('question', 'like', '%شفوي%ترجمة%');
            })
            ->value('id');

        // If question not found, use 0 to ensure no matches
        if (!$oralTranslationQuestionId) {
            $oralTranslationQuestionId = 0;
        }

        $examAnswers = ExamAnswer::with('student')->get();
        $examQuestionsAnswers = ExamQuestionsAnswer::all()->groupBy(['student_id', 'type']);

        $examData = [];

        // Process data from the exam_answers table (امتحنات الشفوى)
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
                    'alhan_score' => 0,
                    'alhan_weight' => 0,
                    'taks_score' => 0,
                    'taks_weight' => 0,
                    'coptic_score' => 0,
                    'coptic_weight' => 0,
                    'coptic_oral_translation_score' => null,
                    'coptic_oral_translation_weight' => null,
                    'agbeya_score' => 0,
                    'agbeya_weight' => 0,
                ];
            }

            $examData[$studentId][$subject . '_score'] = $totalScore;
            $examData[$studentId][$subject . '_weight'] = $totalWeight;
            $examData[$studentId][$subject] = $percentage;

            // For coptic exams, also check if there's an oral translation question in examQuestionsAnswers
            if ($subject === 'coptic' && $oralTranslationQuestionId) {
                $oralTranslationAnswer = ExamQuestionsAnswer::where('student_id', $studentId)
                    ->where('question_id', $oralTranslationQuestionId)
                    ->where(function($query) {
                        $query->where('type', 'Coptic')
                              ->orWhere('type', 'coptic');
                    })
                    ->first();

                if ($oralTranslationAnswer &&
                    ($examData[$studentId]['coptic_oral_translation_score'] === null ||
                     $examData[$studentId]['coptic_oral_translation_weight'] === null)) {
                    $examData[$studentId]['coptic_oral_translation_score'] = $oralTranslationAnswer->score;
                    $examData[$studentId]['coptic_oral_translation_weight'] = $oralTranslationAnswer->wight;
                }
            }
        }

        // Process data from the examQuestionsAnswers table (امتحنات التحريري)
        foreach ($examQuestionsAnswers as $studentId => $subjects) {
            foreach ($subjects as $subject => $subjectAnswers) {
                if ($subject == "Taks")
                    $subject = "taks";
                if ($subject == "Coptic")
                    $subject = "coptic";
                $totalScore = $subjectAnswers->sum('score');
                $totalWeight = $subjectAnswers->sum('wight');
                $percentage = $totalWeight > 0 ? round(($totalScore / $totalWeight) * 100, 2) : 0;

                $student_id = $subjectAnswers->first()->student_id;
                $student = Student::find($student_id);
                $class = ClassModel::find($student->class_id);
                $studentName = $student->name;
                $groupNumber = $class->name;

                if (!isset($examData[$studentId])) {
                    $examData[$studentId] = [
                        'student_name' => $studentName,
                        'std_id' => $studentId,
                        'group_number' => $groupNumber,
                        'alhan' => null,
                        'taks' => null,
                        'coptic' => null,
                        'agbeya' => null,
                        'alhan_score' => 0,
                        'alhan_weight' => 0,
                        'taks_score' => 0,
                        'taks_weight' => 0,
                        'coptic_score' => 0,
                        'coptic_weight' => 0,
                        'coptic_oral_translation_score' => null,
                        'coptic_oral_translation_weight' => null,
                        'agbeya_score' => 0,
                        'agbeya_weight' => 0,
                    ];
                }

                $examData[$studentId][$subject . '_score'] += $totalScore ?? 0;
                $examData[$studentId][$subject . '_weight'] += $totalWeight ?? 0;
                $examData[$studentId][$subject] = $percentage;

                // Extract oral translation question score/weight for coptic exams
                if ($subject === 'coptic' && $oralTranslationQuestionId) {
                    $oralTranslationAnswer = $subjectAnswers->where('question_id', $oralTranslationQuestionId)->first();
                    if ($oralTranslationAnswer) {
                        $examData[$studentId]['coptic_oral_translation_score'] = $oralTranslationAnswer->score;
                        $examData[$studentId]['coptic_oral_translation_weight'] = $oralTranslationAnswer->wight;
                    }
                }
            }
        }

        // Ensure all students with coptic data have oral translation column initialized
        // Also check for oral translation in examQuestionsAnswers for students who might have been processed earlier
        foreach ($examData as $studentId => $data) {
            // If student has coptic data but oral translation is not set, try to find it
            if (($data['coptic'] !== null || $data['coptic_score'] > 0) &&
                ($data['coptic_oral_translation_score'] === null || $data['coptic_oral_translation_weight'] === null)) {

                // Look for oral translation in examQuestionsAnswers for this student
                // Check both "Coptic" and "coptic" case variations
                if ($oralTranslationQuestionId) {
                    $oralTranslationAnswer = ExamQuestionsAnswer::where('student_id', $studentId)
                        ->where('question_id', $oralTranslationQuestionId)
                        ->where(function($query) {
                            $query->where('type', 'Coptic')
                                  ->orWhere('type', 'coptic');
                        })
                        ->first();

                    if ($oralTranslationAnswer) {
                        $examData[$studentId]['coptic_oral_translation_score'] = $oralTranslationAnswer->score;
                        $examData[$studentId]['coptic_oral_translation_weight'] = $oralTranslationAnswer->wight;
                    }
                }
            }
        }


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
            ->lengthMenu([[100, 200, 500, -1], [100, 200, 500, 'Show All']])
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
            Column::make('alhan')->title('Alhan (%)'),
            Column::make('alhan_score')->title('Alhan Score'),
            Column::make('alhan_weight')->title('Alhan Weight'),
            Column::make('taks')->title('Taks (%)'),
            Column::make('taks_score')->title('Taks Score'),
            Column::make('taks_weight')->title('Taks Weight'),
            Column::make('coptic')->title('Coptic (%)'),
            Column::make('coptic_score')->title('Coptic Score'),
            Column::make('coptic_weight')->title('Coptic Weight'),
            Column::make('coptic_oral_translation')->title('شفوى و ترجمة (Score / Weight)'),
            Column::make('agbeya')->title('Agbeya (%)'),
            Column::make('agbeya_score')->title('Agbeya Score'),
            Column::make('agbeya_weight')->title('Agbeya Weight'),
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
