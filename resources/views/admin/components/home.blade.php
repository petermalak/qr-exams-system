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
        <form name="add-blog-post-form" id="add-blog-post-form" method="get"
            action="{{ url('exam-attendances/create') }}">
            @csrf

            <div class="form-group">
                <input required type="text" id="student_id" name="student_id" class="form-control form-elements">
            </div>

        </form>
        <button type="submit" class="button" id="get_data_button">Submit</button>

{{--        <button type="button" class="waves-effect btn btn-lg btn-danger taks" id="get_data_button">--}}
{{--            Get Data--}}
{{--        </button>--}}
    </div>

    <div class="card-body table-responsive p-0">
        <table class="table table-bordered table-striped table-responsive-stack" id="tableOne" hidden>
            <thead>
            <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Group Number</th>
                <th>In Hall</th>
                <th>Alhan</th>
                <th>Coptic</th>
                <th>Taks</th>
                <th>Out Hall</th>
            </tr>
            </thead>
            <tbody>

            </tbody>
        </table>
    </div>

    <script type="text/javascript">

        function onScanError(errorMessage) {}
        var html5QrcodeScanner = new Html5QrcodeScanner(
            "reader", {
                fps: 10,
                // qrbox: 250
            });
        html5QrcodeScanner.render(onScanSuccess, onScanError);
        // setInterval(function() {
        //     // location.reload();
        // }, 5000);

        $("#get_data_button").click(function() {
            var c = confirm('Are you sure?');
            if (c) {
                $.ajax({
                    data: {
                        "_token": "{{ csrf_token() }}",
                        'student_id' : document.getElementById('student_id').value
                    },
                    type: 'POST',
                    url: "{!! route('exam-attendances.show') !!}",
                    success: function(response) {
                        console.log(response);
                        if (response) {
                            // location.reload();
                            var student = response.student;
                            var student_attendance = response.student_attendance
                            var message = $('' +
                                '<div class="alert alert-success m-1" id ="success-message" style="margin:15px; height:2.5rem"  role="alert"> <p class="justify-content-center mb-3">Succesfully</p> <br>' +
                                '</div>');
                            $(".content-wrapper").prepend(message);
                            $('#success-message').fadeOut(10000, function() {
                                $(this).remove();
                            })
                            console.log(student , student_attendance);
                        }

                    }
                });

            }
        })

        function onScanSuccess(qrCodeMessage) {
            document.getElementById('student_id').value = qrCodeMessage;

            $.ajax({
                data: {
                    "_token": "{{ csrf_token() }}",
                    'student_id' : qrCodeMessage
                },
                type: 'POST',
                url: "{!! route('exam-attendances.show') !!}",
                success: function(response) {

                    if (response) {
                        // location.reload();
                        var student = response.student;
                        var student_attendance = response.student_attendance
                        var message = $('' +
                            '<div class="alert alert-success m-1" id ="success-message" style="margin:15px; height:2.5rem"  role="alert"> <p class="justify-content-center mb-3">Succesfully</p> <br>' +
                            '</div>');
                        $(".content-wrapper").prepend(message);
                        $('#success-message').fadeOut(10000, function() {
                            $(this).remove();
                        })
                        console.log(student , student_attendance);
                        var result ='<tr>'+
                            '<td>'+student.id+'</td>'+
                            '<td>'+student.name+'</td>'+
                            '<td>'+student.group_number+'</td>'+
                            '</tr>';
                        $('tbody').html(result);
                        $('table').removeAttr('hidden');
                    }

                }
            });
        }

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
