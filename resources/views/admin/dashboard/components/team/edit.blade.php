@extends('admin.layouts.index')
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
                            <h3 class="card-title">Edit Team</h3>
                        </div>
                        <div class="card-body">
                            {!! Form::open(['route' => ['teams.update', $team], 'id' => 'form-data']) !!}
                            @method('PATCH')
                            {{ csrf_field() }}
                            <div class="card card-primary card-outline card-outline-tabs">
                                <div class="card-body">
                                    <div class="tab-content" id="custom-tabs-four-tabContent">
                                        <div class="tab-pane fade active show" id="english" role="tabpanel"
                                            aria-labelledby="english-tab">
                                            @include('admin.components.team.fields')
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {{ Form::hidden('image_id', $team->image_id, ['id' => 'upload_id']) }}
                            {!! Form::close() !!}
                            {{ Form::label('image', 'Image') }}
                            <a class="nav-link btn-default mb-2" style="cursor: pointer" data-toggle="modal"
                                data-target="#media">Browse Media</a>
                            @include(
                                'admin.uploader.mediaNav',
                                $attr = ['upload_type' => 'single', 'upload_id' => $team->image_id]
                            )
                            <button type="submit" class="btn btn-block btn-success"
                                onclick="$('#form-data').submit()">Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection
