<div class="row">
    <div class="col-sm-4">
        <div class="form-group">
            {{ Form::label('in_hall', 'In Hall') }}
            {{ Form::text('in_hall', $examAttendance->in_hall, ['class' => 'form-control', 'placeholder' => 'In Hall']) }}
        </div>
    </div>
    <div class="col-sm-4">
        <div class="form-group">
            {{ Form::label('alhan', 'Alhan') }}
            {{ Form::text('alhan', $examAttendance->alhan, ['class' => 'form-control', 'placeholder' => 'Alhan']) }}
        </div>
    </div>
    <div class="col-sm-4">
        <div class="form-group">
            {{ Form::label('coptic', 'Coptic') }}
            {{ Form::text('coptic', $examAttendance->coptic, ['class' => 'form-control', 'placeholder' => 'Coptic']) }}
        </div>
    </div>
</div>
<div class="row">
    <div class="col-sm-4">
        <div class="form-group">
            {{ Form::label('taks', 'Taks') }}
            {{ Form::text('taks', $examAttendance->taks, ['class' => 'form-control', 'placeholder' => 'Taks']) }}
        </div>
    </div>
    <div class="col-sm-4">
        <div class="form-group">
            {{ Form::label('agbeya', 'Agbeya') }}
            {{ Form::text('agbeya', $examAttendance->agbeya, ['class' => 'form-control', 'placeholder' => 'Agbeya']) }}
        </div>
    </div>
    <div class="col-sm-4">
        <div class="form-group">
            {{ Form::label('out_hall', 'Out Hall') }}
            {{ Form::text('out_hall', $examAttendance->out_hall, ['class' => 'form-control', 'placeholder' => 'Out Hall']) }}
        </div>
    </div>
</div>
<div class="row">
    <div class="col-sm-4">
        <div class="form-group">
            {{ Form::label('student_id', 'Student ID') }}
            {{ Form::text('student_id', $examAttendance->student_id, ['class' => 'form-control', 'placeholder' => 'Student ID']) }}
        </div>
    </div>
</div>