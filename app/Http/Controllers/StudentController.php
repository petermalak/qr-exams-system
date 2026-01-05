<?php

namespace App\Http\Controllers;

use App\Exports\AgbeyaExamAnswersValues;
use App\Exports\AlhanExamAnswersValues;
use App\Exports\CopticExamAnswersValues;
use App\Exports\ExamAnswersExport;
use App\Exports\ExamAnswersValues;
use App\Exports\ExamAttendanceExport;
use App\Exports\TaksExamAnswersValues;
use App\Imports\StudentsImport;
use App\Models\ClassModel;
use App\Models\ExamAnswer;
use App\Models\ExamQuestionsAnswer;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use ZipArchive;

class StudentController extends Controller
{
    /**
     * Show the form for creating a new resource.
     *
     */
    public function upload_file()
    {
        return view('admin.components.student.import');
    }

    public function import_students(Request $request): RedirectResponse
    {
        $input = $request->all();
        $validator = Validator::make($input, ['file' => 'required']);
        if ($validator->fails()) {
            return redirect()->route('import-student-view')->withErrors($validator)->withInput();
        }
        Excel::import(new StudentsImport, $request->file('file'));
        return redirect()->route('import-student-view')->with(['success' => 'Students Added Successfully']);
    }

    public function export_exam_attendance()
    {
        return Excel::download(new ExamAttendanceExport(), 'students.xlsx')->sendHeaders();
    }

    public function export_exam_answers()
    {

        // return Excel::download(new AlhanExamAnswersValues(), 'alhan2023.xlsx')->sendHeaders();
        // return Excel::download(new CopticExamAnswersValues(), 'coptic2023.xlsx')->sendHeaders();
        // return Excel::download(new TaksExamAnswersValues(), 'taks2023.xlsx')->sendHeaders();
        // return Excel::download(new AgbeyaExamAnswersValues(), 'agbeya2023.xlsx')->sendHeaders();
        return Excel::download(new ExamAnswersExport(), 'Alhan Detailed 2023.xlsx')->sendHeaders();
    }

    public function examAnswersIndex()
    {
        // Fetch all records from the exam_answers table with related student data
        $examAnswers = ExamAnswer::with('student')->get();

        // Fetch all records from the exam_questions_answers table
        $examQuestionsAnswers = ExamQuestionsAnswer::all();

        // Initialize an array to store the processed data
        $examData = [];

        // Process data from the exam_answers table
        foreach ($examAnswers as $exam) {
            // Check if answers are already an array
            if (is_string($exam->answers)) {
                // Decode the answers JSON
                $answers = json_decode($exam->answers, true);
            } else {
                // If it's not a string, assume it's already an array
                $answers = $exam->answers;
            }

            // Initialize variables for total weight and score
            $totalWeight = 0;
            $totalScore = 0;

            // Loop through each answer and sum the weights and scores
            foreach ($answers as $key => $value) {
                if (isset($value['wight']) && isset($value['score'])) {
                    $totalWeight += $value['wight'];
                    $totalScore += $value['score'];
                }
            }

            // Calculate percentage
            $percentage = $totalWeight ? ($totalScore / $totalWeight) * 100 : 0;

            // Store the data in the examData array
            $studentId = $exam->student_id;
            $studentName = $exam->student->name;
            $groupNumber = $exam->student->class_id;
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

            // Assign the percentage to the appropriate subject column
            $examData[$studentId][$subject] = $percentage;
        }

        // Group the exam_questions_answers by student_id and type (subject)
        $groupedExamQuestionsAnswers = $examQuestionsAnswers->groupBy(['student_id', 'type']);

        // Process data from the exam_questions_answers table
        foreach ($groupedExamQuestionsAnswers as $studentId => $subjects) {
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

        // Sort the examData array by group number in ascending order
        usort($examData, function ($a, $b) {
            return $a['group_number'] <=> $b['group_number'];
        });

        // Convert the exam data array to a table HTML with improved styling and a title
        $tableHtml = <<<HTML
            <!DOCTYPE html>
            <html>
            <head>
                <title>Exam Answers Report</title>
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }

                    h1 {
                        text-align: center;
                        margin-bottom: 20px;
                    }

                    th, td {
                        text-align: center;
                        vertical-align: middle;
                    }

                    th {
                        background-color: #f2f2f2;
                    }
                    .even-row {
                    background-color: #f2f2f2; /* Light gray */
                    }
                    .odd-row {
                    background-color: #e6e6e6; /* White */
                    }
                </style>
            </head>
            <body>
            <div class="container">
                <h1>Exam Answers Report</h1>
                <table class="table table-bordered">
                    <thead class="thead-light">
                    <tr>
                        <th>Student Name</th>
                        <th>Student ID</th>
                        <th>Group Number</th>
                        <th>Alhan</th>
                        <th>Taks</th>
                        <th>Coptic</th>
                        <th>Agbeya</th>
                    </tr>
                    </thead>
                    <tbody>
            HTML;

        foreach ($examData as $index => $data) {
            $tableHtml .= '<tr class="' . ($index % 2 == 0 ? 'even-row' : 'odd-row') . '">';
            $tableHtml .= '<td>' . $data['student_name'] . '</td>';
            $tableHtml .= '<td>' . $data['std_id'] . '</td>';
            $tableHtml .= '<td>' . $data['group_number'] . '</td>';
            $tableHtml .= '<td' . ($data['alhan'] < 50 ? ' class="text-danger"' : '') . '>' . (isset($data['alhan']) ? number_format($data['alhan'], 2) . '%' : '') . '</td>';
            $tableHtml .= '<td' . ($data['taks'] < 50 ? ' class="text-danger"' : '') . '>' . (isset($data['taks']) ? number_format($data['taks'], 2) . '%' : '') . '</td>';
            $tableHtml .= '<td' . ($data['coptic'] < 50 ? ' class="text-danger"' : '') . '>' . (isset($data['coptic']) ? number_format($data['coptic'], 2) . '%' : '') . '</td>';
            $tableHtml .= '<td' . ($data['agbeya'] < 50 ? ' class="text-danger"' : '') . '>' . (isset($data['agbeya']) ? number_format($data['agbeya'], 2) . '%' : '') . '</td>';
            $tableHtml .= '</tr>';
        }

        $tableHtml .= <<<HTML
                    </tbody>
                </table>
            </div>
            </body>
            </html>
            HTML;

        return $tableHtml;
    }
}
