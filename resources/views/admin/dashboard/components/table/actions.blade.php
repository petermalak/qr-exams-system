<div class="row m-0 p-0">
    <div class="col-md-6 d-flex justify-content-end">
        <a class="btn btn-info btn-sm" href="{{ route("$page.edit", $data->id) }}">
            <i class="fas fa-pencil-alt">
            </i>
            Edit
        </a>
    </div>
    <div class="col-md-6">
        <form method="POST" action="{{ route("$page.destroy", $data->id) }}" onsubmit="return confirm('Are you sure?')">
            @csrf
            <input type="hidden" name="_method" value="DELETE">
            <button type="submit" class="btn btn-danger btn-sm">
                Delete
            </button>
        </form>
    </div>
</div>
