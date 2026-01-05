<!-- resources/views/attendance/update.blade.php -->

@extends('layouts.app')

@section('content')
<div class="container">
    <h2>Update Exam Attendance</h2>
    <form action="{{ route('exam-attendances.update') }}" method="POST">
        @csrf
        <input type="hidden" name="exam_id" value="{{ $exam->id }}">
        <input type="hidden" name="student_id" value="{{ $student->id }}">

        <div class="form-group">
            <label for="attendance_status">Attendance Status</label>
            <select name="attendance_status" id="attendance_status" class="form-control">
                <option value="1" @if($examAttendance->attendance_status) selected @endif>Present</option>
                <option value="0" @if(!$examAttendance->attendance_status) selected @endif>Absent</option>
            </select>
        </div>

        <button type="submit" class="btn btn-primary">Update Attendance</button>
    </form>

    @if(session('success'))
        <div class="alert alert-success mt-2">
            {{ session('success') }}
        </div>
    @endif

    @if(session('error'))
        <div class="alert alert-danger mt-2">
            {{ session('error') }}
        </div>
    @endif
</div>
@endsection
