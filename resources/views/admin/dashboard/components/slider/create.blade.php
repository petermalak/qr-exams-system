@extends('admin.layouts.index')
@section('content')
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1>Create</h1>
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
                            <h3 class="card-title">Create Slider</h3>
                        </div>
                        <div class="card-body">
                            {!! Form::open(['route' => ['sliders.store', $slider], 'id' => 'form-data']) !!}
                            @method('POST')
                            {{ csrf_field() }}
                            @include('admin.components.slider.fields')
                            {{ Form::hidden('image_id', '', ['id' => 'upload_id']) }}
                            {!! Form::close() !!}
                            {{ Form::label('image', 'Image') }}
                            <a class="nav-link btn-default mb-2" style="cursor: pointer" data-toggle="modal"
                                data-target="#media">Browse Media</a>
                            <span>Image size : 1820 x 751 </span>
                            @include(
                                'admin.uploader.mediaNav',
                                $attr = [
                                    'upload_type' => 'single',
                                    'upload_id' => old('upload_id') ? old('upload_id') : 0,
                                ]
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
