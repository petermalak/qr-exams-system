@extends('admin.layouts.index')
@section('content')
    <script src="{{ asset('./admin/html5-qrcode.min.js') }}"></script>

{{--    <section class="content-header">--}}
{{--        <div class="container-fluid">--}}
{{--            <div class="row mb-2">--}}
{{--                <div class="col-sm-6">--}}
{{--                    <h1>Exam Selection شفوى</h1>--}}
{{--                </div>--}}
{{--                <div class="col-sm-6">--}}
{{--                    <a href="{{ url('/take-written-exam') }}" class="btn btn-block btn-danger"> الذهاب الى الامتحان التحريرى</a>--}}
{{--                </div>--}}
{{--            </div>--}}
{{--        </div><!-- /.container-fluid -->--}}
{{--    </section>--}}

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
                <h3 class="card-title">Exam Selection </h3>

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
                            <div style="width: 70%; height:50%; margin: auto;" id="reader"></div>
                        </div>
                    </div>

                    <form name="exam-selection" id="exam-selection" method="get" action="{{ route('RouteToExam') }}">
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

                                    <div class="wrapper">
                                        <input type="radio" name="type" value="alhan" id="option-1">
                                        <input type="radio" name="type" value="coptic" id="option-2">
                                        <input type="radio" name="type" value="taks" id="option-3">
                                        <input type="radio" name="type" value="agbeya" id="option-4">


                                        <label for="option-1" class="option option-1">
                                            <div class="dot"></div>
                                            <span>ألحان</span>
                                        </label>
                                        <label for="option-2" class="option option-2">
                                            <div class="dot"></div>
                                            <span>قبطى</span>
                                        </label>
                                        <label for="option-3" class="option option-3">
                                            <div class="dot"></div>
                                            <span>طقس</span>
                                        </label>
                                        <label for="option-4" class="option option-4">
                                            <div class="dot"></div>
                                            <span>اجبية</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-block btn-success mb-3">Submit</button>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <style>
        .wrapper .option {
            background: #fff;
            height: 100%;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-evenly;
            margin: 5px;
            border-radius: 5px;
            cursor: pointer;
            padding: 0 10px;
            border: 2px solid lightgrey;
            transition: all 0.3s ease;

        }

        .wrapper .option .dot {
            height: 20px;
            width: 20px;
            background: #d9d9d9;
            border-radius: 50%;
            position: relative;
        }

        .wrapper .option .dot::before {
            position: absolute;
            content: "";
            top: 4px;
            left: 4px;
            width: 12px;
            height: 12px;
            background: #0069d9;
            border-radius: 50%;
            opacity: 0;
            transform: scale(1.5);
            transition: all 0.3s ease;
        }

        input[type="radio"] {
            display: none;
        }

        #option-1:checked:checked~.option-1,
        #option-2:checked:checked~.option-2,
        #option-3:checked:checked~.option-3,
        #option-3:checked:checked~.option-4 {
            border-color: #888d92;
            background: #888d92;
        }

        #option-1:checked:checked~.option-1 .dot,
        #option-2:checked:checked~.option-2 .dot,
        #option-3:checked:checked~.option-3 .dot,
        #option-4:checked:checked~.option-4 .dot {
            background: #fff;
        }

        #option-1:checked:checked~.option-1 .dot::before,
        #option-2:checked:checked~.option-2 .dot::before,
        #option-3:checked:checked~.option-3 .dot::before,
        #option-4:checked:checked~.option-4 .dot::before {
            opacity: 1;
            transform: scale(1);
        }

        .wrapper .option span {
            font-size: 20px;
            color: #808080;
        }

        #option-1:checked:checked~.option-1 span,
        #option-2:checked:checked~.option-2 span,
        #option-3:checked:checked~.option-3 span,
        #option-4:checked:checked~.option-4 span {
            color: #fff;
        }
    </style>
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
