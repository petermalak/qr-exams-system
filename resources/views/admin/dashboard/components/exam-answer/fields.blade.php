<div class="row">
    <div class="col-sm-6">
        <div class="form-group">
            {{ Form::label('type', 'Exam Type') }}
            {{ Form::text('type', $examAnswer->type, ['class' => 'form-control', 'placeholder' => 'Exam Type']) }}
        </div>
    </div>
    <div class="col-sm-6">
        <div class="form-group">
            {{ Form::label('examiner', 'Examiner') }}
            {{ Form::text('examiner', $examAnswer->examiner, ['class' => 'form-control', 'placeholder' => 'Examiner']) }}
        </div>
    </div>
    <div class="col-sm-6">
        <div class="form-group">
            {{ Form::label('student_id', 'Student ID') }}
            {{ Form::text('student_id', $examAnswer->student_id, ['class' => 'form-control', 'placeholder' => 'Student ID']) }}
        </div>
    </div>
</div>

@foreach ($decodedAnswers as $index => $answer)
    <div class="row">

        @if (isset($answer['original-question']))
            <div class="col-sm-6">
                <div class="form-group">
                    {{ Form::label('', 'Question') }}
                    {!! $answer['original-question'] !!}
                </div>
            </div>
        @else
            <div class="col-sm-6">
                <div class="form-group">
                    {{ Form::label('', 'Question') }}
                </div>
            </div>
        @endif


        @if (isset($answer['wight']))
            <div class="col-sm-3">
                <div class="form-group">
                    {{ Form::label("answers[$index][wight]", 'Weight') }}
                    {{ Form::text("answers[$index][wight]", $answer['wight'], ['class' => 'form-control', 'placeholder' => 'Weight', 'disabled' => true]) }}
                </div>
            </div>
        @endif

        @if (isset($answer['score']))
            <div class="col-sm-3">
                <div class="form-group">
                    {{ Form::label("answers[$index][score]", 'Score') }}
                    {{ Form::number("answers[$index][score]", $answer['score'], ['class' => 'form-control', 'placeholder' => 'Score']) }}
                </div>
            </div>
        @endif
    </div>
@endforeach
