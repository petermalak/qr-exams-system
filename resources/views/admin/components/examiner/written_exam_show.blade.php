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
                    <form action="{{ route('take-written-exam.update') }}" id="exam-selection" method="POST"
                        name="exam-selection">
                        @csrf
                        {{-- <input type="hidden" id="id" name="id" class="form-control"
                            value="{{ $exam_answer->id }}"> --}}
                        <input type="hidden" id="type" name="type" class="form-control"
                            value="{{ $exam->type }}">
                        <div class="row">
                            <div class="col-4">
                                <div class="form-group">
                                    <label>ID :{{ $student->id }}</label>
                                    <input type="hidden" id="student_id" name="student_id" class="form-control"
                                        value="{{ $student->id }}">
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
                                    <input type="hidden" id="examiner" name="examiner" class="form-control"
                                        value="{{ $examiner }}">
                                </div>
                            </div>
                        </div>
                        <table class="table table-bordered table-striped table-responsive-stack" id="tableOne">
                            <thead>
                                <tr>
                                    {{-- <th>#</th> --}}
                                    <th>السؤال</th>
                                    <th>درجة السؤال</th>
                                    <th>الاختيارات</th>
                                    {{-- <th>إظهار الإجابة</th> --}}
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($questions as $key => $item)
                                    {{-- @php
                                        $key += 1;
                                    @endphp --}}
                                    {{-- @if ($key === 0)
                                        @continue
                                    @endif --}}
                                    <tr>
                                        {{-- <td id="question_number">{{ $key }}</td> --}}

                                        @if (str_contains($item->question, 'div'))
                                            <td id="question">
                                                <input type="hidden" class="form-control input-name original-question"
                                                    name="answers[{{ $key + 1 }}][original-question]"
                                                    value="{{ $item->question }}">
                                                {!! html_entity_decode($item->question) !!}
                                            </td>
                                        @else
                                            <td id="question">
                                                <input type="hidden" class="form-control input-name original-question"
                                                    name="answers[{{ $key }}][original-question]"
                                                    value="{{ $item->question }}">
                                                <input type="hidden" class="form-control input-name original-question"
                                                    name="answers[{{ $key }}][question_id]"
                                                    value="{{ $item->id }}">

                                                @php
                                                    $text = $item->question;
                                                    $parts = explode('@', $text);
                                                @endphp

                                                @foreach ($parts as $i => $part)
                                                    @if ($i % 2 == 0)
                                                        {{ $part }}
                                                        <!-- Arabic text or any other non-Coptic content -->
                                                    @else
                                                        <span class="coptic-text">{{ $part }}</span>
                                                        <!-- Coptic text with the applied style -->
                                                    @endif
                                                @endforeach


                                                {{-- {{ $item->question }} --}}
                                            </td>
                                        @endif


                                        <td id="wight">{{ $item->wight }}</td>
                                        <input type="hidden" class="form-control input-name" id="wight{{ $key }}"
                                            name="answers[{{ $key }}][wight]" value="{{ $item->wight }}">


                                        <td>

                                            @foreach (json_decode($item->answers) as $index => $option)
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
                                                                value="@if ($option->status == 1) {{ $item->wight }} @else  0 @endif"
                                                                @if ($option->status == 1) checked @endif>
                                                            {{ $part }}
                                                        </label>
                                                    @else
                                                        <label class="m-1 coptic-text">
                                                            <input type="radio"
                                                                name="answers[{{ $key }}][score]"
                                                                value="@if ($option->status == 1) {{ $item->wight }} @else  0 @endif"
                                                                @if ($option->status == 1) checked @endif>
                                                            {{ $part }}
                                                        </label>
                                                    @endif
                                                @endforeach
                                            @endforeach





                                            {{-- <select name="answers[{{ $key }}][score]"
                                                id="answers[{{ $key }}][score]" class="select2">
                                                @foreach (json_decode($item->answers) as $index => $option)
                                                    @php
                                                        $text = $option->answer;
                                                        $parts = explode('@', $text);
                                                        $parts = array_filter($parts, function ($part) {
                                                            return trim($part) !== '';
                                                        });
                                                    @endphp

                                                    @foreach ($parts as $i => $part)
                                                        @if ($i % 2 == 0)
                                                            <option
                                                                value="@if ($option->status == 1) {{ $item->wight }} @else  0 @endif">
                                                                {{ $part }}</option>
                                                        @else
                                                            <option
                                                                value="@if ($option->status == 1) {{ $item->wight }} @else  0 @endif"
                                                                class="coptic-text" selected>{{ $part }}</option>
                                                        @endif
                                                    @endforeach
                                                    </option>
                                                @endforeach
                                            </select> --}}
                                        </td>




                                        {{-- <td id="student_inhall">
                                            <input type="number" min="0" step="0.1" max="{{ $item->wight }}"
                                                class="form-control input-name" id="mark-{{ $key }}"
                                                name="answers[{{ $key }}][score]" required
                                                value="{{ $item->score }}">
                                        </td> --}}
                                        {{-- <td>
                                                <button type="button" class="btn btn-info show-answer-btn"
                                                    data-answer="{{ $answers[$key - 1] }}">
                                                    Show Answer
                                                </button>
                                            </td> --}}
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                        <button type="submit" onclick="showConfirmation()" class="btn btn-primary">Submit</button>
                    </form>
                </div>
            </div>
        </div>
    </section>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const showAnswerButtons = document.querySelectorAll('.show-answer-btn');

            showAnswerButtons.forEach(function(button) {
                // Store the original question outside the loop
                const originalQuestion = button.closest('tr').querySelector('.original-question').value;

                button.addEventListener('click', function() {
                    const row = this.closest('tr');
                    const answerCell = row.querySelector('#question');
                    const answer = this.getAttribute('data-answer');

                    if (this.textContent.trim() === 'Show Answer') {
                        answerCell.innerHTML = answer; // Show the answer
                        this.textContent = 'Hide Answer';
                    } else {
                        answerCell.innerHTML = originalQuestion; // Show the original question
                        this.textContent = 'Show Answer';
                    }
                });
            });
        });

        function showConfirmation() {
            const confirmation = confirm('Are you sure you want to submit the form?');

            if (confirmation) {
                // Handle form submission
                const myForm = document.getElementById('exam-selection');
                myForm.submit();
            } else {
                // Cancel form submission
                console.log('Form submission cancelled');
            }
        }
    </script>
@endsection
