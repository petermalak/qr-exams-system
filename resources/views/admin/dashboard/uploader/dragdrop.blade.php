@php
    $modal = isset($attr['modal_name']) ? $attr['modal_name'] : 'main';
@endphp
<form action="{{ route('uploads.store') }}" method="POST" name="files" enctype="multipart/form-data"
    id="{{ $modal }}" class="dropzone">
    @csrf
</form>

<script>
    Dropzone.autoDiscover = false; // This is optional in this case
    $(document).ready(function() {
        var myAwesomeDropzone = new Dropzone("form#{{ $modal }}", {
            url: '{{ route('uploads.store') }}',
            addRemoveLinks: true,
            maxFiles: '{{ $attr['upload_type'] }}' === 'single' ? 1 : null,
            headers: {
                'X-CSRF-TOKEN': "{{ csrf_token() }}"
            },
            // Dropzone settings
            init: function() {
                var myDropzone = this;
                this.on("success", function(files, response) {
                    var name = "#".concat(
                        "{{ isset($attr['section_id']) ? $attr['section_id'] : 'upload_id' }}"
                    )
                    $('#document-dropzone').append(
                        '<input type="hidden" name="document[]" value="' + response
                        .name + '">')
                    //Set the upload id in the hidden input
                    if ('{{ $attr['upload_type'] }}' === 'single') {
                        // $(".{{ $modal }}" + '_span').html("Selected");
                        $(name).val(response.id);
                    } else {
                        let values = []
                        let images = {};
                        if ($(name).val()) {
                            if ("{{ $modal }}" !== "gallery_upload") {
                                images = JSON.parse($(name).val())
                            } else
                                values = JSON.parse($(name).val())
                        }

                        x = Object.keys(images).length;
                        if ("{{ $modal }}" !== "gallery_upload") {
                            images["s" + x] = response.id;
                        } else {
                            values.push(response.id);
                        }

                        if ("{{ $modal }}" !== "gallery_upload") {
                            // $(".{{ $modal }}" + '_span').html("Selected")
                            $(name).val(JSON.stringify(images));
                        } else {
                            $(".{{ $modal }}").html("Selected: " + values.length)
                            $(name).val(JSON.stringify(values));
                        }
                    }
                });
                this.on("error", function(files, response) {

                });
            }
        })
    });
</script>
