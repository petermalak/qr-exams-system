@extends("admin.layouts.index")
@section('content')
    <div class="container mt-5">
        <form action="{{route('import-students')}}" method="post" enctype="multipart/form-data">
            <h3 class="text-center mb-5">Upload File in Laravel</h3>
            @csrf
            <div class="custom-file">
                <input type="file" name="file" class="custom-file-input" id="chooseFile">
                <label class="custom-file-label" for="chooseFile">Select file</label>
            </div>
            <button type="submit" name="submit" class="btn btn-primary btn-block mt-4">
                Upload Files
            </button>
        </form>
    </div>
@endsection
