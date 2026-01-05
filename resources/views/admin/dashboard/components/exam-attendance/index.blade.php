@extends('admin.dashboard.layouts.index')
@section('content')
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1>Sliders</h1>
                </div>
                <div class="col-sm-4">
                </div>
                <div class="col-sm-2">
                    <a href="{{ route('exam-attendances.create') }}" type="button" class="btn btn-block btn-primary btn-md">Create
                        Exam Attendance</a>
                </div>
            </div>
        </div><!-- /.container-fluid -->
    </section>

    <!-- Main content -->
    <section class="content">

        <!-- Default box -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Exam Attendances</h3>

                <div class="card-tools">
                    <button type="button" class="btn btn-tool" data-card-widget="collapse" title="Collapse">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button type="button" class="btn btn-tool" data-card-widget="remove" title="Remove">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="card-body p-0">
                <table class="table table-striped projects">
                    <thead>
                        <tr>
                            <th style="width: 1%">
                                #
                            </th>
                            <th style="width: 20%">
                                In Hall
                            </th>
                            <th style="width: 20%">
                                Alhan
                            </th>
                            <th style="width: 10%">
                                Coptic
                            </th>
                            <th style="width: 20%">
                                Taks
                            </th>
                            <th style="width: 20%">
                                Agbeya
                            </th>
                            <th style="width: 20%">
                                Out Hall
                            </th>
                            <th style="width: 20%">
                                Student Id
                            </th>
                            <th style="width: 20%">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($examAttendances as $examAttendance)
                            <tr>
                                <td>
                                    {{ $examAttendance->id }}
                                </td>
                                <td>
                                    <span>
                                        {{ $examAttendance->in_hall }}
                                    </span>
                                </td>
                                <td>
                                    <span>
                                        {{ $examAttendance->alhan }}
                                    </span>
                                </td>
                                <td>
                                    <span>
                                        {{ $examAttendance->coptic }}
                                    </span>
                                </td>
                                <td>
                                    <span>
                                        {{ $examAttendance->taks }}
                                    </span>
                                </td>
                                <td class="project_progress">
                                    <span>
                                        {{ $examAttendance->agbeya }}
                                    </span>
                                </td>
                                <td>
                                    <span>
                                        {{ $examAttendance->out_hall }}
                                    </span>
                                </td>
                                <td>
                                    <span>
                                        {{ $examAttendance->student_id }}
                                    </span>
                                </td>
                                <td class="project-actions">
                                    @include('admin.dashboard.components.table.actions', [
                                        'page' => 'exam-attendances',
                                        'data' => $examAttendance,
                                    ])
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <!-- /.card-body -->
        </div>
        <!-- /.card -->
        {{-- Pagination --}}
        <div class="d-flex justify-content-center">
            {!! $examAttendances->links() !!}
        </div>

    </section>
    <!-- /.content -->
@endsection
