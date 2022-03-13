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
                @if(Request::route()->getPrefix() == '/alhan' || Request::route()->getPrefix() == '/door')
                    <th>Alhan</th>
                @endif
                @if(Request::route()->getPrefix() == '/coptic' || Request::route()->getPrefix() == '/door')
                    <th>Coptic</th>
                @endif
                @if(Request::route()->getPrefix() == '/taks' || Request::route()->getPrefix() == '/door')
                    <th>Taks</th>
                @endif
                <th >Out Hall</th>
            </tr>
            </thead>
            <tbody>
                <td id="student_id"></td>
                <td id="student_name"></td>
                <td id="student_group_number"></td>
                <td id="student_inhall"></td>
                @if(Request::route()->getPrefix() == '/alhan' || Request::route()->getPrefix() == '/door' || )
                    <td id="student_alhan"> </td>
                @else
                    <td hidden id="student_alhan"> </td>
                @endif
                @if(Request::route()->getPrefix() == '/coptic' || Request::route()->getPrefix() == '/door')
                    <td id="student_coptic"></td>
                @else
                    <td hidden id="student_coptic"> </td>
                @endif
                @if(Request::route()->getPrefix() == '/taks' || Request::route()->getPrefix() == '/door')
                    <td id="student_taks"></td>
                @else
                    <td hidden id="student_taks"> </td>
                @endif
                <td id="student_outhall"></td>
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
                    }
                });

            }
        })

        function onScanSuccess(qrCodeMessage) {
            // document.getElementById('student_id').value = qrCodeMessage;

            $.ajax({
                data: {
                    "_token": "{{ csrf_token() }}",
                    'student_id' : qrCodeMessage,
                    'prefix' : '{{Request::route()->getPrefix()}}'
                },
                type: 'POST',
                url: "{!! route('exam-attendances.show') !!}",
                statusCode: {
                    400: function(response) {
                        let student = response.responseJSON.student;
                        let student_attendance = response.responseJSON.student_attendance;
                        console.log(student,student_attendance)
                        let message = $('' +
                            '<div class="alert alert-dange m-1" id ="error-message" style="margin:15px; height:2.5rem"  role="alert"> <p class="justify-content-center mb-3">There is Exam missing</p> <br>' +
                            '</div>');
                        $(".content-wrapper").prepend(message);
                        $('#success-message').fadeOut(2000, function() {
                            $(this).remove();
                        })
                        add_values_to_table(student , student_attendance)
                    },
                    200: function (response){
                        if (response) {
                            // location.reload();
                            let student = response.student;
                            let student_attendance = response.student_attendance;
                            let message = $('' +
                                '<div class="alert alert-success m-1" id ="success-message" style="margin:15px; height:2.5rem"  role="alert"> <p class="justify-content-center mb-3">Succesfully</p> <br>' +
                                '</div>');
                            $(".content-wrapper").prepend(message);
                            $('#success-message').fadeOut(2000, function() {
                                $(this).remove();
                            })
                            add_values_to_table(student , student_attendance)
                        }
                    }
                },
            });
        }

        function convert_bool_to_string(value) {
            if (value) return 'Examed';
            else return 'Not Examed'
        }
        function add_cell_style(element_id) {
            let element = document.getElementById(element_id);
            let html = document.getElementById(element_id).innerHTML;
            if(html === 'Examed'){
                element.classList.add('green_background');
            }
            else{
                element.classList.add('red_background');
            }
        }
        function add_values_to_table(student , student_attendance){
            $('#student_id').html(student.id);
            $('#student_name').html(student.name);
            $('#student_group_number').html(student.group_number);
            $('#student_inhall').html(convert_bool_to_string(student_attendance.in_hall));
            add_cell_style('student_inhall')
            $('#student_alhan').html(convert_bool_to_string(student_attendance.alhan));
            add_cell_style('student_alhan')
            $('#student_coptic').html(convert_bool_to_string(student_attendance.coptic));
            add_cell_style('student_coptic')
            $('#student_taks').html(convert_bool_to_string(student_attendance.taks));
            add_cell_style('student_taks')
            $('#student_outhall').html(convert_bool_to_string(student_attendance.out_hall));
            add_cell_style('student_outhall')
            $('table').removeAttr('hidden');
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

        .green_background{
            background-color:#27a800
        }
        .red_background{
            background-color:#FF0000
        }
    </style>
@endsection
