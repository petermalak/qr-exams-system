<!-- resources/views/your-view.blade.php -->

@extends('admin.layouts.index')

@section('content')
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    @if ($exam->type == 'alhan')
                        <h1>امتحان الحان</h1>
                    @elseif($exam->type == 'coptic')
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
        <div id="timer"></div>

        <!-- Default box -->
        <div class="card">
            @if (session('status'))
                <div class="alert alert-success">
                    {{ session('status') }}
                </div>
            @endif
            <div class="card-header">
                @if ($exam->type == 'alhan')
                    <h3 class="card-title">امتحان الحان</h3>
                @elseif($exam->type == 'coptic')
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
                    <form action="{{ route('take-written-exam.update') }}" id="exam-selection" method="POST" name="exam-selection">
                        @csrf
                        <input type="hidden" id="type" name="type" class="form-control" value="{{ $exam->type }}">
                        <div class="row">
                            <div class="col-4">
                                <div class="form-group">
                                    <label>ID :{{ $student->id }}</label>
                                    <input type="hidden" id="student_id" name="student_id" class="form-control" value="{{ $student->id }}">
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="form-group">
                                    <label>اسم الطالب :{{ $student->name }}</label>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="form-group">
                                    <label>اسم الخادم | الخادمة :{{ $examiner }}</label>
                                    <input type="hidden" id="examiner" name="examiner" class="form-control" value="{{ $examiner }}">
                                </div>
                            </div>
                        </div>
                        <table class="table table-bordered table-striped table-responsive-stack" id="tableOne">
                            <thead>
                                <tr>
                                    <th>السؤال</th>
                                    <th>درجة السؤال</th>
                                    <th>الاختيارات</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($questions as $key => $item)
                                    <tr>
                                        @if (str_contains($item->question, 'div'))
                                            <td id="question">
                                                <input type="hidden" class="form-control input-name original-question" name="answers[{{ $key }}][original-question]" value="{{ $item->question }}">
                                                {!! html_entity_decode($item->question) !!}
                                                <input type="hidden" class="form-control input-name original-question" name="answers[{{ $key }}][question_id]" value="{{ $item->id }}">
                                            </td>
                                        @else
                                            <td id="question">
                                                <input type="hidden" class="form-control input-name original-question" name="answers[{{ $key }}][original-question]" value="{{ $item->question }}">
                                                <input type="hidden" class="form-control input-name original-question" name="answers[{{ $key }}][question_id]" value="{{ $item->id }}">
                                                @php
                                                    $text = $item->question;
                                                    $parts = explode('@', $text);
                                                @endphp
                                                @foreach ($parts as $i => $part)
                                                    @if ($i % 2 == 0)
                                                        {{ $part }}
                                                    @else
                                                        <span class="coptic-text">{{ $part }}</span>
                                                    @endif
                                                @endforeach
                                            </td>
                                        @endif
                                        <td id="wight">{{ $item->wight }}</td>
                                        <input type="hidden" class="form-control input-name" id="wight{{ $key }}" name="answers[{{ $key }}][wight]" value="{{ $item->wight }}">
                                        <td>
                                            @if ($item->answers != '[]')
                                                @foreach (json_decode($item->answers) as $index => $option)
                                                    @if (str_contains($option->answer, 'div'))
                                                        <input type="radio" name="answers[{{ $key }}][score]"
                                                            value="{{ $option->status == 1 ? $item->wight : 0 }}"
                                                            {{ $option->status == 1 ? 'checked' : '' }}>
                                                        {!! html_entity_decode($option->answer) !!}
                                                    @else
                                                        @php
                                                            $text = $option->answer;
                                                            $parts = explode('@', $text);
                                                            $parts = array_filter($parts, function ($part) {
                                                                return trim($part) !== '';
                                                            });
                                                        @endphp

                                                        @foreach ($parts as $i => $part)
                                                            @if ($i % 2 == 0)
                                                                <label class="m-1">
                                                                    <input type="radio"
                                                                        name="answers[{{ $key }}][score]"
                                                                        value="{{ $option->status == 1 ? $item->wight : 0 }}"
                                                                        {{ $option->status == 1 ? 'checked' : '' }}>
                                                                    {{ $part }}
                                                                </label>
                                                            @else
                                                                <label class="m-1 coptic-text">
                                                                    <input type="radio"
                                                                        name="answers[{{ $key }}][score]"
                                                                        value="{{ $option->status == 1 ? $item->wight : 0 }}"
                                                                        {{ $option->status == 1 ? 'checked' : '' }}>
                                                                    {{ $part }}
                                                                </label>
                                                            @endif
                                                        @endforeach
                                                    @endif
                                                @endforeach
                                            @else
                                                <input type="number" min="0" step="0.5"
                                                    max="{{ $item->wight }}" class="form-control input-name" min="0"
                                                    id="mark-{{ $key }}"
                                                    name="answers[{{ $key }}][score]" required
                                                    value="{{ $item->score }}">
                                            @endif
                                        </td>

                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                        @if ($exam->type == 'coptic')
                            <button onclick="nextForm(event)" class="btn btn-primary" id="nextBtn">Next</button>
                            <button type="submit" onclick="showConfirmation()" class="btn btn-primary" id="submitBtn">Submit</button>
                        @else
                            <button type="submit" onclick="showConfirmation()" class="btn btn-primary">Submit</button>
                        @endif
                    </form>
                </div>
            </div>
        </div>
    </section>
@endsection
