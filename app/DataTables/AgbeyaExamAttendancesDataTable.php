<?php

namespace App\DataTables;

use App\Models\ExamAttendance;
use App\Models\Student;
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
                return $data->agbeya == 0 ? 'Not Examed' : 'Examed';
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
        return $model->newQuery()->where('agbeya',0)->where('in_hall',1);
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
            ->pageLength(25)
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
