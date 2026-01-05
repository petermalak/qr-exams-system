<?php

namespace App\DataTables;

use App\Models\Booking\BookingExams;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Html\Button;
use Yajra\DataTables\Html\Column;
use Yajra\DataTables\Services\DataTable;

class BookingExamsDataTable extends DataTable
{
    public function dataTable($query)
    {
        return datatables()
            ->eloquent($query)
            ->addColumn('action', function ($data) {
                return "Action Buttons Here"; // Placeholder for action buttons
            });
    }

    public function query(BookingExams $model)
    {
        // Use Eloquent to query the BookingExams model if needed
        $query = $model->newQuery()
            ->select('name')
            ->selectRaw('MAX(CASE WHEN type = "alhan" THEN date END) AS alhan')
            ->selectRaw('MAX(CASE WHEN type = "taks" THEN date END) AS taks')
            ->selectRaw('MAX(CASE WHEN type = "coptic" THEN date END) AS coptic')
            ->selectRaw('MAX(CASE WHEN type = "agbia" THEN date END) AS agbia')
            ->groupBy('name');

        return $query;
    }


    public function html()
    {
        return $this->builder()
            ->setTableId('booking-exams-table')
            ->columns($this->getColumns())
            ->minifiedAjax()
            ->dom('Blfrtip')
            ->lengthMenu([[10, 25, 50, -1], [10, 25, 50, 'Show All']])
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
            Column::make('name')->title('Name'),
            Column::make('alhan')->title('Alhan Exam Date'),
            Column::make('taks')->title('Taks Exam Date'),
            Column::make('coptic')->title('Coptic Exam Date'),
            Column::make('agbia')->title('Agbia Exam Date'),
            Column::computed('action')
                ->exportable(false)
                ->printable(false)
                ->width(60)
                ->addClass('text-center'),
        ];
    }

    protected function filename()
    {
        return 'BookingExams_' . date('YmdHis');
    }
}
