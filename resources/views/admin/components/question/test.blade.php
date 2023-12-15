@extends("admin.layouts.index")
@section('content')
    <div class="container mt-5">
        <form action="{{route('ttt')}}" method="post" enctype="multipart/form-data">
            <h3 class="text-center mb-5">Upload q</h3>
            @csrf
            <div class="custom-file">
                <input type="text" name="array" class="custom-array-input" id="choosearray">
                <label class="custom-array-label" for="choosearray">Select array</label>
            </div>
            <button type="submit" name="submit" class="btn btn-primary btn-block mt-4">
                Upload Files
            </button>
        </form>
    </div>
@endsection
