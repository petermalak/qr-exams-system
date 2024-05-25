@php
    if (!isset($uploads)) {
        $uploads = \App\Models\Upload::all();
    }
    $modal = isset($attr['modal_name']) ? $attr['modal_name'] : 'main';
    $section_id = isset($attr['section_id']) ? $attr['section_id'] : 'upload_id';
@endphp
<div class="modal-body-{{ $modal }}">
    <div class="wall-{{ $modal }}">
        @foreach ($uploads as $upload)
            <label class="brick tile-picker-{{ $modal }}">
                <input type="checkbox" name="check-{{ $modal }}" class="check-{{ $modal }}"
                    value="{{ $upload->id }}">
                <img src="{!! gallery($upload->file_name) !!}" style="object-fit: contain">
                <i class="tile-checked"></i>
            </label>
        @endforeach
        {{--        <div class=" d-flex justify-content-center"> --}}
        {{--            {!! $uploads->links() !!} --}}
        {{--        </div> --}}
    </div>
</div>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src="https://unpkg.com/json5@^2.0.0/dist/index.min.js"></script>

<script>
    $(document).ready(function() {
        var upload_ids = JSON.parse("{{ $attr['upload_id'] }}");
        if (!isNaN(upload_ids) && upload_ids > 0 && !Array.isArray(upload_ids)) {
            var Checkboxs = document.getElementsByName('check-{{ $modal }}');
            for (var checkbox of Checkboxs) {
                if (checkbox.value == upload_ids) {
                    $(checkbox).addClass("active")
                    checkbox.setAttribute("checked", "checked")
                } else
                    checkbox.setAttribute("disabled", "true")
            }
        } else if (Array.isArray(upload_ids)) {
            var Checkboxs = document.getElementsByName('check-{{ $modal }}');
            for (var id of upload_ids) {
                for (var checkbox of Checkboxs) {
                    if (checkbox.value == id) {
                        $(checkbox).addClass("active")
                        checkbox.setAttribute("checked", "checked")
                    }
                }
            }
        }
        // To select only one choice
        if ('{{ $attr['upload_type'] }}' === 'single') {
            $('.check-{{ $modal }}').change(function() {
                $('.check-{{ $modal }}').not(this).prop('disabled', this.checked);
            });
        }

        // Tile Picker Active Border
        $(document).on("click", ".tile-picker-{{ $modal }} input", function(e) {
            if ($(this).is(":checked")) {
                $(this).closest(".tile-picker-{{ $modal }}").addClass("active");
            } else {
                $(this).closest(".tile-picker-{{ $modal }}").removeClass("active");
            }
            checkList();
        });


        function checkList() {
            var name = "#".concat("{{ $section_id }}")
            let sectionName = "{{ $modal }}".slice(0, "{{ $modal }}".lastIndexOf('_'));
            let SectionX = $("." + sectionName + "_upload.active").data(sectionName)
            var checkList = [];
            let images = {};
            if ($(name).val()) {
                images = JSON.parse($(name).val())
            }
            var markedCheckbox = document.getElementsByName('check-{{ $modal }}');
            for (var checkbox of markedCheckbox) {
                if (checkbox.checked) {
                    if ("{{ $modal }}" !== "gallery_upload" && "{{ $attr['upload_type'] }}" !==
                        "single") {
                        images["s" + SectionX] = checkbox.value;
                    } else {
                        checkList.push(checkbox.value)
                    }
                }
            }
            if ('{{ $attr['upload_type'] }}' === 'single') {
                $(".{{ $modal }}" + '_span').html("Selected")
                $(name).val(checkList[0]);

            } else {
                if ("{{ $modal }}" !== "gallery_upload") {
                    let length = Object.keys(images["s" + SectionX]).length
                    let id_num = Object.keys(images).length - 1
                    $("." + sectionName + "_upload_" + $("." + sectionName + "_upload.active").data(
                        sectionName)).html("Selected: " + parseInt(length))
                    var test = name.concat("_").concat(id_num)
                    $(test).val(images["s" + id_num.toString()]);
                    $(name).val(JSON.stringify(images));
                } else {
                    $(".{{ $modal }}" + '_span').html("Selected: " + checkList.length)
                    $(name).val(JSON.stringify(checkList));
                }
            }
        }

        $(document).on('click', '.page-link', function(event) {
            event.preventDefault();
            var page = $(this).attr('href').split('page=')[1];
            fetch_data(page);
        });

        function fetch_data(page) {
            $.ajax({
                url: "{{ route('uploads.fetch') }}",
                method: "POST",
                data: {
                    _token: "{{ csrf_token() }}",
                    page: page
                },
                success: function(data) {
                    $('.wall-{{ $modal }}').html(data);
                },
            });
        }
    });
</script>

<style>
    .brick img {
        width: 100px;
        height: 100px;
        background: #f2f2f2;
    }

    .tile-picker-{{ $modal }} {
        position: relative;
        cursor: pointer;
        background-color: #eaeaea;
        background-position: center center;
        background-size: cover;
        box-shadow: inset 0 0 10px rgba(0, 0, 0, .1);
        outline: 2px solid #fff;
        outline-offset: -3px;
        border: 1px solid #bbb;
    }

    .active.tile-picker-{{ $modal }} {
        border-color: #aaa;
    }

    .tile-picker-{{ $modal }} input[type=checkbox] {
        opacity: 0;
        position: absolute;
        left: -80px;
    }

    .tile-checked {
        display: block;
        font-style: normal;
        width: 20px;
        height: 20px;
        position: absolute;
        top: -2px;
        right: -4px;
    }

    .tile-checked:after {
        content: '\2713';
        display: block;
        line-height: 18px;
        width: 18px;
        height: 18px;

        background-color: #1481b8;
        color: #fff;
        border-radius: 2px;
        font-size: 13px;
        text-align: center;
        font-weight: bold;

        opacity: 0;
        transition: opacity .34s ease-in-out;
    }


    input[type=checkbox]:checked~.tile-checked:after {
        opacity: 1;
    }
</style>
