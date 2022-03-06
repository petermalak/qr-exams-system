@extends("admin.layouts.index")
@section('content')
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">Student Data</h3>
        </div>

        <div class="card-body table-responsive p-0">
            <table class="table table-bordered table-striped table-responsive-stack" id="tableOne">
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
                    <tr>
                        <td> {{ $student->id }} </td>
                        <td> {{ $student->name }} </td>
                        <td> {{ $student->group_number }} </td>

                        {{-- Entering Hall --}}
                        @if ($student_attendance->in_hall)
                            <td style="background-color:#27a800"> Finished </td>
                        @else
                            <td style="background-color:#FF0000"> Not entered </td>
                        @endif

                        {{-- Entering Alhan Exam --}}
                        @if ($student_attendance->alhan)
                            <td style="background-color:#27a800"> Finished </td>
                        @else
                            <td style="background-color:#FF0000"> Not entered </td>
                        @endif

                        {{-- Entering Coptic Exam --}}
                        @if ($student_attendance->coptic)
                            <td style="background-color:#27a800"> Finished </td>
                        @else
                            <td style="background-color:#FF0000"> Not entered </td>
                        @endif

                        {{-- Entering taks Exam --}}
                        @if ($student_attendance->taks)
                            <td style="background-color:#27a800"> Finished </td>
                        @else
                            <td style="background-color:#FF0000"> Not entered </td>
                        @endif

                        {{-- Exit hall --}}
                        @if ($student_attendance->out_hall)
                            <td style="background-color:#27a800"> Finished </td>
                        @else
                            <td style="background-color:#FF0000"> Not entered </td>
                        @endif

                    </tr>

                </tbody>
            </table>
        </div>

        <button type="button" class="waves-effect btn btn-lg btn-light alhan" id="alhan_button">
            Alhan
        </button>
        <button type="button" class="waves-effect btn btn-lg btn-light coptic" id="coptic_button">
            Coptic
        </button>
        <button type="button" class="waves-effect btn btn-lg btn-light taks" id="taks_button">
            Taks
        </button>
        <button type="button" class="waves-effect btn btn-lg btn-light taks" id="exit_button">
            Exit
        </button>
    </div>


    <script>
        $("#alhan_button").click(function() {
            var c = confirm('Are you sure?');
            if (c) {
                $.ajax({
                    data: {
                        "_token": "{{ csrf_token() }}"
                    },
                    type: 'POST',
                    url: "{!! route('attendance.alhan', ['student_id' => $student->id]) !!}",
                    success: function(response) {
                        if (response) {
                            location.reload();
                            var message = $('' +
                                '<div class="alert alert-success m-1" id ="success-message" style="margin:15px; height:2.5rem"  role="alert"> <p class="justify-content-center mb-3">Succesfully</p> <br>' +
                                '</div>');
                            $(".content-wrapper").prepend(message);
                            $('#success-message').fadeOut(10000, function() {
                                $(this).remove();
                            })
                        }

                    }
                });

            }
        })

        $("#coptic_button").click(function() {
            var c = confirm('Are you sure?');
            if (c) {
                $.ajax({
                    data: {
                        "_token": "{{ csrf_token() }}"
                    },
                    type: 'POST',
                    url: "{!! route('attendance.coptic', ['student_id' => $student->id]) !!}",
                    success: function(response) {
                        if (response) {
                            location.reload();
                            var message = $('' +
                                '<div class="alert alert-success m-1" id ="success-message" style="margin:15px; height:2.5rem"  role="alert"> <p class="justify-content-center mb-3">Succesfully</p> <br>' +
                                '</div>');
                            $(".content-wrapper").prepend(message);
                            $('#success-message').fadeOut(10000, function() {
                                $(this).remove();
                            })
                        }

                    }
                });

            }
        })

        $("#taks_button").click(function() {
            var c = confirm('Are you sure?');
            if (c) {
                $.ajax({
                    data: {
                        "_token": "{{ csrf_token() }}"
                    },
                    type: 'POST',
                    url: "{!! route('attendance.taks', ['student_id' => $student->id]) !!}",
                    success: function(response) {
                        if (response) {
                            location.reload();
                            var message = $('' +
                                '<div class="alert alert-success m-1" id ="success-message" style="margin:15px; height:2.5rem"  role="alert"> <p class="justify-content-center mb-3">Succesfully</p> <br>' +
                                '</div>');
                            $(".content-wrapper").prepend(message);
                            $('#success-message').fadeOut(10000, function() {
                                $(this).remove();
                            })
                        }

                    }
                });

            }
        })

        $("#exit_button").click(function() {
            var c = confirm('Are you sure?');
            if (c) {
                $.ajax({
                    data: {
                        "_token": "{{ csrf_token() }}"
                    },
                    type: 'POST',
                    url: "{!! route('attendance.exit', ['student_id' => $student->id]) !!}",
                    success: function(response) {
                        if (response) {
                            location.reload();
                            var message = $('' +
                                '<div class="alert alert-success m-1" id ="success-message" style="margin:15px; height:2.5rem"  role="alert"> <p class="justify-content-center mb-3">Succesfully</p> <br>' +
                                '</div>');
                            $(".content-wrapper").prepend(message);
                            $('#success-message').fadeOut(10000, function() {
                                $(this).remove();
                            })
                        }

                    }
                });

            }
        })
    </script>


    <script type="text/javascript">
        $(document).ready(function() {
            // inspired by http://jsfiddle.net/arunpjohny/564Lxosz/1/
            $('.table-responsive-stack').each(function(i) {
                var id = $(this).attr('id');
                //alert(id);
                $(this).find("th").each(function(i) {
                    $('#' + id + ' td:nth-child(' + (i + 1) + ')').prepend(
                        '<span class="table-responsive-stack-thead">' + $(this).text() +
                        ':</span> ');
                    $('.table-responsive-stack-thead').hide();

                });
            });

            $('.table-responsive-stack').each(function() {
                var thCount = $(this).find("th").length;
                var rowGrow = 100 / thCount + '%';
                //console.log(rowGrow);
                $(this).find("th, td").css('flex-basis', rowGrow);
            });

            function flexTable() {
                if ($(window).width() < 768) {

                    $(".table-responsive-stack").each(function(i) {
                        $(this).find(".table-responsive-stack-thead").show();
                        $(this).find('thead').hide();
                    });


                    // window is less than 768px
                } else {


                    $(".table-responsive-stack").each(function(i) {
                        $(this).find(".table-responsive-stack-thead").hide();
                        $(this).find('thead').show();
                    });
                }
            }

            flexTable();

            window.onresize = function(event) {
                flexTable();
            };
        });
    </script>
    <style>
        .table-responsive-stack tr {
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-orient: horizontal;
            -webkit-box-direction: normal;
            -ms-flex-direction: row;
            flex-direction: row;
        }

        .table-responsive-stack td,
        .table-responsive-stack th {
            display: block;
            /*
                   flex-grow | flex-shrink | flex-basis   */
            -ms-flex: 1 1 auto;
            flex: 1 1 auto;
        }

        .table-responsive-stack .table-responsive-stack-thead {
            font-weight: bold;
        }

        @media screen and (max-width: 768px) {
            .table-responsive-stack tr {
                -webkit-box-orient: vertical;
                -webkit-box-direction: normal;
                -ms-flex-direction: column;
                flex-direction: column;
                border-bottom: 3px solid #ccc;
                display: block;

            }

            /*  IE9 FIX   */
            .table-responsive-stack td {
                float: left\9;
                width: 100%;
            }
        }

    </style>
@endsection
