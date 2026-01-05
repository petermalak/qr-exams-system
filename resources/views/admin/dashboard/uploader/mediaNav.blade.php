@php
    $modal = isset($attr['modal_name']) ? $attr['modal_name'] : 'main';
@endphp


@if (isset($attr['modal_name']))
    <div class="modal fade  {{ $modal }}" id="{{ $modal }}">
    @else
        <div class="modal fade" id="media">
@endif
<div class="modal-dialog modal-lg">
    <div class="modal-content">
        <div class="modal-header">
            <h4 class="modal-title">Browse Media</h4>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="card card-primary card-outline card-outline-tabs">
            <div class="card-header p-0 border-bottom-0">
                <ul class="nav nav-tabs" id="{{ $modal }}" role="tablist">
                    <li class="nav-item">
                        <a class="nav-link active" id="first-{{ $modal }}-tab" data-toggle="pill"
                            href="#first-{{ $modal }}" role="tab" aria-controls="first-{{ $modal }}"
                            aria-selected="true">Upload</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" id="second-{{ $modal }}-tab" data-toggle="pill"
                            href="#second-{{ $modal }}" role="tab" aria-controls="second-{{ $modal }}"
                            aria-selected="false">Select</a>
                    </li>
                </ul>
            </div>
            <div class="card-body">
                <div class="tab-content" id="{{ $modal }}Content">
                    <div class="tab-pane fade active show" id="first-{{ $modal }}" role="tabpanel"
                        aria-labelledby="first-{{ $modal }}-tab">
                        @include('admin.uploader.dragdrop')
                    </div>
                    <div class="tab-pane fade" id="second-{{ $modal }}" role="tabpanel"
                        aria-labelledby="second-{{ $modal }}-tab">
                        @include('admin.uploader.media')
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer justify-content-between">
            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
            {{-- <button type="button" class="btn btn-primary" data-dismiss="modal">Save changes</button> --}}
        </div>
    </div>
</div>
</div>
