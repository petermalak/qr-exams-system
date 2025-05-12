<?php

namespace App\DataTables;

use App\Models\Booking\BookingExams;
use App\Models\ExamAttendance;
use App\Models\Student;
use App\Services\AttendanceService;
use Illuminate\Database\Eloquent\Builder;
use Yajra\DataTables\DataTableAbstract;
use Yajra\DataTables\Html\Button;
use Yajra\DataTables\Html\Column;
use Yajra\DataTables\Html\Editor\Editor;
use Yajra\DataTables\Html\Editor\Fields;
use Yajra\DataTables\Services\DataTable;

class AgbeyaExamAttendancesDataTable extends DataTable
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
            ->eloquent($query)
            ->editColumn("agbeya", function ($data) {
                return $data->agbeya == 1 ? 'Examed' : 'Not Examed';
            })->editColumn("student name", function ($data) {
                return Student::find($data->student_id)->name;
            });
    }

    /**
     * Get query source of dataTable.
     *
     * @param ExamAttendance $model
     * @return Builder
     */
    public function query(ExamAttendance $model): Builder
    {
        $today = date('Y-m-d');
        // Get the student IDs with exams today
        $examStudents = BookingExams::all()->filter(function ($exam) use ($today) {
            $examDate = AttendanceService::parseArabicDate($exam->date);
            return $examDate && $examDate->format('Y-m-d') === $today && $exam->type == 'agbia';
        })->pluck('name'); // Collect student names with exams today

        // Query the attendance for students with exams today
        return $model->newQuery()
            ->whereIn('student_id', function ($query) use ($examStudents) {
                $query->select('id')
                    ->from('students')
                    ->whereIn('name', $examStudents);
            })->where('in_hall', 1)->where('agbeya',0); // Ensure they are in the hall
    }

    /**
     * Optional method if you want to use html builder.
     *
     * @return \Yajra\DataTables\Html\Builder
     */
    public function html(): \Yajra\DataTables\Html\Builder
    {
        return $this->builder()
            ->setTableId('datatable')
            ->rowId("id")
            ->columns($this->getColumns())
            ->minifiedAjax()
            ->dom('Blfrtip')
            ->lengthMenu([5, 10, 25, 50, 100])
            ->pageLength(50)
            ->orderBy(0, "asce")
            ->buttons(
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
            // Column::make('id')->title("ID"),
            Column::make('agbeya'),
            Column::make('student name'),
            Column::make('student_id'),
        ];
    }

    /**
     * Get filename for export.
     *
     * @return string
     */
    protected function filename(): string
    {
        return 'AgbeyaExamAttendances_' . date('YmdHis');
    }
}
