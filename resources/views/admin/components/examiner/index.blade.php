@extends('admin.layouts.index')
@section('content')
    <script src="{{ asset('./admin/html5-qrcode.min.js') }}"></script>

    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1>Exam Selection</h1>
                </div>
            </div>
        </div><!-- /.container-fluid -->
    </section>

    <!-- Main content -->
    <section class="content">

        <!-- Default box -->
        <div class="card">
            @if (session('status'))
                <div class="alert alert-success">
                    {{ session('status') }}
                </div>
            @endif
            <div class="card-header">
                <h3 class="card-title">Exam Selection</h3>

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



                    <h1 style="text-align: center;"> Scanner (sahmamsa school)</h1>
                    <div class="row" style="text-align: center;">
                        <div class="col">
                            <div style="width: 70%; height:400px; margin: auto;" id="reader"></div>
                        </div>
                    </div>

                    <form name="exam-selection" id="exam-selection" method="get" action="{{ route('take-exam.create') }}">
                        @csrf
                        <div class="row">
                            <div class="col-12">
                                <div class="form-group">
                                    <label for="student_id">ID</label>
                                    <input type="text" id="student_id" name="student_id" class="form-control"
                                        value="">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12">
                                <div class="form-group">
                                    <label for="examiner">اسم الخادم | الخادمة</label>
                                    <input type="text" id="examiner" name="examiner" class="form-control"
                                        required="">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12">
                                <div class="form-group">
                                    <label for="type">اسم الامتحان</label>
                                    <div class="radio">
                                        <label>
                                            <input type="radio" name="type" value="alhan" id="alhan">الحان
                                        </label>
                                        <label>
                                            <input type="radio" name="type" value="coptic" id="coptic">قبطى
                                        </label>
                                        <label>
                                            <input type="radio" name="type" value="taks" id="taks">طقس
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">Submit</button>
                    </form>
                </div>
            </div>
        </div>
    </section>
    <script type="text/javascript">
        function onScanError(errorMessage) {}
        var html5QrcodeScanner = new Html5QrcodeScanner(
            "reader", {
                fps: 10,
                rememberLastUsedCamera: true
            });
        html5QrcodeScanner.render(onScanSuccess, onScanError);

        function onScanSuccess(qrCodeMessage) {
            document.getElementById('student_id').value = qrCodeMessage;
            let message = $('' +
                '<div class="alert alert-success m-1" id ="success-message" style="margin:15px; height:2.5rem"  role="alert"> <p class="justify-content-center mb-3">Succesfully</p> <br>' +
                '</div>');
            $(".content").prepend(message);
            $('#success-message').fadeOut(2000, function() {
                $(this).remove();
            })
        }
    </script>
@endsection
