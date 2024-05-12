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
                                                    @else
                                                        <span class="coptic-text">{{ $part }}</span>
                                                    @endif
                                                @endforeach
                                            </td>
                                        @endif


                                        <td id="wight">{{ $item->wight }}</td>
                                        <input type="hidden" class="form-control input-name" id="wight{{ $key }}"
                                            name="answers[{{ $key }}][wight]" value="{{ $item->wight }}">


                                        <td>
                                            @if ($item->answers != '[]')
                                                @foreach (json_decode($item->answers) as $index => $option)
                                                    @if (str_contains($option->answer, 'div'))
                                                        <input type="radio" name="answers[{{ $key }}][score]"
                                                            value="@if ($option->status == 1) {{ $item->wight }} @else  0 @endif">
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
                                                                        value="@if ($option->status == 1) {{ $item->wight }} @else  0 @endif"
                                                                        @if ($option->status == 1) {{ 'checked' }} @endif>
                                                                    {{ $part }}
                                                                </label>
                                                            @else
                                                                <label class="m-1 coptic-text">
                                                                    <input type="radio"
                                                                        name="answers[{{ $key }}][score]"
                                                                        value="@if ($option->status == 1) {{ $item->wight }} @else  0 @endif"
                                                                        @if ($option->status == 1) {{ 'checked' }} @endif>
                                                                    {{ $part }}
                                                                </label>
                                                            @endif
                                                        @endforeach
                                                    @endif
                                                @endforeach
                                            @else
                                                <input type="number" min="0" step="0.1"
                                                    max="{{ $item->wight }}"
                                                    class="form-control input-named @if ($exam->type == 'coptic') scored-question @endif"
                                                    min="0" id="mark-{{ $key }}"
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

                            <button type="submit" onclick="showConfirmation()" class="btn btn-primary"
                                id="submitBtn">Submit</button>
                        @else
                            <button type="submit" onclick="showConfirmation()" class="btn btn-primary">Submit</button>
                        @endif

                    </form>
                </div>
            </div>
        </div>
    </section>

    <style>
        #timer {
            font-size: 24px;
            text-align: center;
            margin: 20px;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            color: white;
            background-color: rgb(31, 31, 31);
        }

        #submitBtn {
            display: none;

        }

        .scored-question {
            display: none;
        }
    </style>
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


        // Set the timer duration in seconds
        const timerDuration = 900; // 5 minutes
        let timeRemaining = timerDuration;

        // Function to update the timer display
        function updateTimer() {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            document.getElementById('timer').innerHTML = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }

        // Function to handle timer expiration
        function onTimerEnd() {
            const modalContainer = document.createElement('div');
            modalContainer.id = 'myModal'; // Give it an ID for styling
            modalContainer.style.cssText = `
                                            position: fixed;
                                            top: 0;
                                            left: 0;
                                            right: 0;
                                            bottom: 0;
                                            background-color: rgba(0, 0, 0, 0.5); // Adjust transparency
                                            z-index: 100; // Place modal above other elements
                                            display: none; // Initially hidden

                                        `;

            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                                            margin: auto;
                                            width: 50%;
                                            background-color: white;
                                            padding: 20px;
                                        `;

            // Add your desired content to the modal content element
            const text = document.createElement('p');
            text.textContent = 'لقد انتهى الوقت';
            modalContent.appendChild(text);

            // Add the content to the modal container and append to body
            modalContainer.appendChild(modalContent);
            document.body.appendChild(modalContainer);

            // Show the modal
            modalContainer.style.display = 'block';

            const myForm = document.getElementById('exam-selection');
            myForm.submit();
        }

        // Function to start the timer
        function startTimer() {
            const timerInterval = setInterval(function() {
                if (timeRemaining > 0) {
                    timeRemaining--;
                    updateTimer();
                } else {
                    clearInterval(timerInterval);
                    onTimerEnd();
                }
            }, 1000);
        }

        // Start the timer when the page loads
        window.onload = function() {
            startTimer();
        };


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

        function nextForm(event) {
            event.preventDefault(); // Prevent form submission

            document.querySelectorAll('.input-name').forEach(function(input) {
                input.style.display = 'none';
            });

            document.querySelectorAll('.scored-question').forEach(function(input) {
                input.style.display = 'block';
            });

            document.querySelector('#nextBtn').style.display = 'none';
            document.querySelector('#submitBtn').style.display = 'block';
            timeRemaining = 900;
        }
    </script>
@endsection
