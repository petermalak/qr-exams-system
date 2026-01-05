@extends('admin.layouts.index')
@section('content')
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1>About Us</h1>
                </div>
                <div class="col-sm-4">
                </div>
            </div>
        </div><!-- /.container-fluid -->
    </section>

    <!-- Main content -->
    <section class="content">

        <!-- Default box -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">About Us</h3>

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
                {!! Form::open(['route' => ['about_us.update'], 'id' => 'form-data', 'method' => 'post']) !!}
                <table class="table table-striped projects">
                    <thead>
                        <tr>
                            <th style="width: 30%">
                                Name
                            </th>
                            <th style="width: 30%">
                                Data
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        @csrf
                        @foreach ($about_us as $item)
                            <tr>
                                <td>
                                    <span>
                                        {{ $item->message }}
                                    </span>
                                </td>
                                <td>
                                    @if (str_contains($item->type, 'image'))
                                        {{ Form::hidden($item->type, $item->value, ['id' => $item->type]) }}
                                        <a class="nav-link btn-default" style="cursor: pointer" data-toggle="modal"
                                            data-target="#{{ $item->type }}_upload">Browse Media
                                            <span class="float-right green {{ $item->type }}_upload"></span>
                                        </a>
                                    @else
                                        {{ Form::text($item->type, $item->value, ['class' => 'form-control']) }}
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
                {!! Form::close() !!}
                @foreach ($about_us as $item)
                    @if (str_contains($item->type, 'image'))
                        @include(
                            'admin.uploader.mediaNav',
                            $attr = [
                                'upload_type' => 'single',
                                'upload_id' => (int) $item->value,
                                'modal_name' => $item->type . '_upload',
                                'section_id' => $item->type,
                            ]
                        )
                    @endif
                @endforeach
                <button type="submit" class="btn btn-success float-right m-3" onclick="$('#form-data').submit()">Save
                    Changes
                </button>
            </div>
            <!-- /.card-body -->
        </div>
        <!-- /.card -->

    </section>
    <!-- /.content -->

    <script>
        $(document).ready(function() {
            $('.templatingSelect2').select2({
                theme: "bootstrap4",
            });
        });
    </script>
@endsection
