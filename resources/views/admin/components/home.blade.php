@extends("admin.layouts.index")
@section('content')
    <script src="/admin/html5-qrcode.min.js"></script>

    <h1 style="text-align: center;"> QR code Scanner (sahmamsa school)</h1>

    <div class="row" style="text-align: center;">
        <div class="col">
            <div style="width: 500px; height:500px; margin: auto;" id="reader"></div>
        </div>
    </div>
    <div>
        <form name="add-blog-post-form" id="add-blog-post-form" method="get" action="{{ url('exam-attendances/create') }}">
            @csrf

            <div class="form-group">
                <input required type="text" id="student_id" name="student_id" class="form-control form-elements" >
            </div>
            <button type="submit" class="button">Submit</button>

        </form>
    </div>


    <script type="text/javascript">
        function onScanSuccess(qrCodeMessage) {
            document.getElementById('student_id').value = qrCodeMessage;
        }

        function onScanError(errorMessage) {}
        var html5QrcodeScanner = new Html5QrcodeScanner(
            "reader", {
                fps: 10,
                // qrbox: 250
            });
        html5QrcodeScanner.render(onScanSuccess, onScanError);
    </script>


    <style>
        body {
            background-color: #cccccc;
            table-layout: fixed;
        }

        .button {
            padding: 15px 25px;
            font-size: 24px;
            text-align: center;
            cursor: pointer;
            outline: none;
            color: #fff;
            background-color: #527c6d;
            border: none;
            border-radius: 15px;
            box-shadow: 0 9px #999;
            width: 25%;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }

        .button:hover {
            background-color: #3e8e41
        }

        .button:active {
            background-color: #3e8e41;
            box-shadow: 0 5px #666;
            transform: translateY(4px);
        }

        .form-elements {
            width: 30%;
            text-align: center;
            height: 50px;
            padding: 12px 20px;
            box-sizing: border-box;
            border: 2px solid rgb(156, 89, 89);
            border-radius: 4px;
            background-color: #f8f8f8;
            font-size: 16px;
            resize: none;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }

    </style>
@endsection
