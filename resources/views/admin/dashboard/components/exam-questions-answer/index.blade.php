@extends('admin.dashboard.layouts.index')

@section('content')
<section class="content-header">
    <div class="container-fluid">
        <div class="row mb-2">
            <div class="col-sm-6">
                <h1>Exam Questions Answers</h1>
            </div>
            <div class="col-sm-4"></div>
            <div class="col-sm-2">
                <a href="{{ route('exam-questions-answers.create') }}" class="btn btn-block btn-primary btn-md">Create Exam Questions Answers</a>
            </div>
        </div>
    </div>
</section>

<section class="content">
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">Exam Questions Answers</h3>
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
            {!! $dataTable->table(['class' => 'table table-striped projects'], true) !!}
        </div>
    </div>
</section>
@endsection

@push('scripts')
    {!! $dataTable->scripts() !!}
@endpush
