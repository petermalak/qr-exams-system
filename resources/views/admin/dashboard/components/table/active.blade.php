<form method="POST" action="{{ route("$page.active", ['id' => $data->id]) }}" onsubmit="return confirm('Are you sure?')">
    @csrf
    <input type="hidden" name="_method" value="POST">
    @if ($data->active)
        <button type="submit" class="btn btn-warning btn-sm">
            Deactivate
        </button>
    @else
        <button type="submit" class="btn btn-warning btn-sm">
            Activate
        </button>
    @endif

</form>
