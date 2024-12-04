@extends('admin.dashboard.layouts.index')
@section('content')
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1>Edit</h1>
                </div>
                <div class="col-sm-6">
                </div>
            </div>
        </div>
    </section>
    <section class="content">
        <div class="container-fluid">
            <div class="row">
                <div class="col-md-12">
                    <div class="card card-primary">
                        <div class="card-header">
                            <h3 class="card-title">Edit Exam Answers</h3>
                        </div>
                        <div class="card-body">
                            {!! Form::open(['route' => ['exam-answers.update', $examAnswer], 'id' => 'form-data']) !!}
                            @method('PATCH')
                            {{ csrf_field() }}
                            @include('admin.dashboard.components.exam-answer.fields')
                            {!! Form::close() !!}
                            <button type="submit" class="btn btn-block btn-success"
                                onclick="$('#form-data').submit()">Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection
