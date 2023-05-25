@extends('admin.layouts.index')
@section('content')
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    @if ($exam_answer->type == 'alhan')
                        <h1>امتحان الحان</h1>
                    @elseif($exam_answer->type == 'coptic')
                        <h1>امتحان قبطى</h1>
                    @else
                        <h1>امتحان طقس</h1>
                    @endif
                </div>
            </div>
        </div>
    </section>

    <!-- Main content -->
    <section class="content">

        <!-- Default box -->
        <div class="card">
            @if (session('status'))
                <div class="alert alert-success">
                    {{ session('status') }}
                </div>
            @endif
            <div class="card-header">
                @if ($exam_answer->type == 'alhan')
                    <h3 class="card-title">امتحان الحان</h3>
                @elseif($exam_answer->type == 'coptic')
                    <h3 class="card-title">امتحان قبطى</h3>
                @else
                    <h3 class="card-title">امتحان طقس</h3>
                @endif
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

                <div class="container-fluid">
                    <form action="{{ route('take-exam.update') }}" id="exam-selection" method="POST" name="exam-selection">
                        @csrf
                        <input type="hidden" id="id" name="id" class="form-control"
                            value="{{ $exam_answer->id }}">
                        <input type="hidden" id="type" name="type" class="form-control"
                            value="{{ $exam_answer->type }}">
                        <div class="row">
                            <div class="col-4">
                                <div class="form-group">
                                    <label>ID :{{ $exam_answer->student_id }}</label>
                                    <input type="hidden" id="student_id" name="student_id" class="form-control"
                                        value="{{ $exam_answer->student_id }}">
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="form-group">
                                    <label>اسم الطالب :{{ $student->name }}</label>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="form-group">
                                    <label>اسم الخادم | الخادمة :{{ $exam_answer->examiner }}</label>
                                    <input type="hidden" id="examiner" name="examiner" class="form-control"
                                        value="{{ $exam_answer->examiner }}">
                                </div>
                            </div>
                        </div>
                        <table class="table table-bordered table-striped table-responsive-stack" id="tableOne">
                            <thead>
                                <tr>
                                    {{-- <th>#</th> --}}
                                    <th>السؤال</th>
                                    <th>درجة السؤال</th>
                                    <th>الدرجة</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($exam_answer->answers as $key => $item)
                                    {{-- @php
                                        $key += 1;
                                    @endphp --}}
                                    <tr>
                                        {{-- <td id="question_number">{{ $key }}</td> --}}
                                        <td id="question">{{ $item->question }}</td>
                                        <input type="hidden" class="form-control input-name"
                                            id="question-{{ $key }}"
                                            name="answers[{{ $key }}][question]" value="{{ $item->question }}">
                                        <td id="wight">{{ $item->wight }}</td>
                                        <input type="hidden" class="form-control input-name" id="wight{{ $key }}"
                                            name="answers[{{ $key }}][wight]" value="{{ $item->wight }}">
                                        <td id="student_inhall">
                                            <input type="number" min="0" step="0.1" max="{{ $item->wight }}"
                                                class="form-control input-name" id="mark-{{ $key }}"
                                                name="answers[{{ $key }}][score]" required
                                                value="{{ $item->score }}">
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                        <button type="submit" class="btn btn-primary">Submit</button>
                    </form>
                </div>
            </div>
        </div>
    </section>
@endsection
