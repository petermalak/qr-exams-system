<div class="row">
    <div class="col-sm-6">
        <div class="form-group">
            {{ Form::label('student_id', 'Student ID') }}
            {{ Form::text('student_id', $student_id, ['class' => 'form-control', 'placeholder' => 'Student ID', 'disabled' => true]) }}
        </div>
    </div>
    <div class="col-sm-6">
        <div class="form-group">
            {{ Form::label('type', 'Exam Type') }}
            {{ Form::text('type', $type, ['class' => 'form-control', 'placeholder' => 'Exam Type', 'disabled' => true]) }}
        </div>
    </div>
</div>

@foreach ($examQuestionsAnswers as $index => $examQuestionsAnswer)
    <div class="row">
        <div class="col-sm-6">
            <div class="form-group">
                {{ Form::label('', 'Question') }}
                {!! $examQuestionsAnswer->question->question !!}
            </div>
        </div>

        <div class="col-sm-3">
            <div class="form-group">
                {{ Form::label("answers[{$examQuestionsAnswer->id}][wight]", 'Weight') }}
                {{ Form::text("answers[{$examQuestionsAnswer->id}][wight]", $examQuestionsAnswer->wight, ['class' => 'form-control', 'placeholder' => 'Weight', 'disabled' => true]) }}
            </div>
        </div>

        <div class="col-sm-3">
            <div class="form-group">
                {{ Form::label("answers[{$examQuestionsAnswer->id}][score]", 'Score') }}
                {{ Form::number("answers[{$examQuestionsAnswer->id}][score]", $examQuestionsAnswer->score, ['class' => 'form-control', 'placeholder' => 'Score']) }}
            </div>
        </div>
    </div>
@endforeach