@extends('admin.layouts.index')
@section('content')
    <section class="content-header">
        <div class="container-fluid">
            <h1>Choose Path</h1>
        </div>
    </section>

    <!-- Main content -->
    <section class="content">

        <!-- Default box -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">All Project Pathes</h3>
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
                    <div class="row">
                        <div class="col-4">
                            <a href="{{ url('/take-exam') }}" class="btn btn-block btn-primary"> Take
                                Exam</a>
                        </div>
                        <div class="col-4">
                            <a href="{{ url('/door-entrance') }}" class="btn btn-block btn-primary"> Door
                                Entrance</a>
                        </div>
                        <div class="col-4">
                            <a href="{{ url('/door-exit') }}" class="btn btn-block btn-primary"> Door
                                Exit</a>
                        </div>
                    </div>

                    <br>
                    <br>
                    <div class="row">
                        <div class="col-3">
                            <a href="{{ url('/alhan') }}" class="btn btn-block btn-primary">Alhan Out</a>
                        </div>
                        <div class="col-3">
                            <a href="{{ url('/coptic') }}" class="btn btn-block btn-primary">Coptic Out </a>
                        </div>
                        <div class="col-3">
                            <a href="{{ url('/taks') }}" class="btn btn-block btn-primary">Taks Out </a>
                        </div>
                        <div class="col-3">
                            <a href="{{ url('/agbeya') }}" class="btn btn-block btn-primary">Agbeya Out </a>
                        </div>
                    </div>
                    <br>
                    <br>
                    <div class="row">
                        <div class="col-3">
                            <a href="{{ url('/alhan/exam') }}" class="btn btn-block btn-primary">Alhan In</a>
                        </div>
                        <div class="col-3">
                            <a href="{{ url('/coptic/exam') }}" class="btn btn-block btn-primary">Coptic In</a>
                        </div>
                        <div class="col-3">
                            <a href="{{ url('/taks/exam') }}" class="btn btn-block btn-primary">Taks In</a>
                        </div>
                        <div class="col-3">
                            <a href="{{ url('/agbeya/exam') }}" class="btn btn-block btn-primary">Agbeya In</a>
                        </div>
                    </div>
                    <br>
                    <div class="row">
                        <div class="col-12">
                            <a href="{{ url('/take-written-exam') }}" class="btn btn-block btn-danger">Written Exam</a>
                        </div>
                    </div>
                    <br>
                    <br>
                </div>
            </div>
        </div>
    </section>
@endsection
