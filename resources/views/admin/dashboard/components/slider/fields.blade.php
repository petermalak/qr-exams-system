<div class="row">
    <div class="col-sm-4">
        <div class="form-group">
            {{ Form::label('title', 'Title') }}
            {{ Form::text('title', $slider->title, ['class' => 'form-control', 'placeholder' => 'Title']) }}

        </div>
    </div>
    <div class="col-sm-4">
        <div class="form-group">
            {{ Form::label('link', 'Link') }}
            {{ Form::text('link', $slider->link, ['class' => 'form-control', 'placeholder' => 'Link']) }}
        </div>
    </div>
    <div class="col-sm-4">
        <div class="form-group">
            {{ Form::label('subtitle', 'Subtitle') }}
            {{ Form::text('subtitle', $slider->subtitle, ['class' => 'form-control']) }}
        </div>
    </div>
</div>
