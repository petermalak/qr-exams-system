@if(session("error") != null)
    @if(is_array(session("error")))
        <div class="alert alert-danger" style="margin:15px" role="alert">
            @foreach (session("error") as $succ)
                • {{$succ}} <br>
            @endforeach
        </div>
    @else
        <div class="alert alert-danger" style="margin:15px" role="alert">
            • {{session("error")}} <br>
        </div>
    @endif
@endif
