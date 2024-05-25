<div class="row">
    <div class="col-sm-4">
        <div class="form-group">
            {{ Form::label('name', 'Name') }}
            {{ Form::text('name', $team->name, ['class' => 'form-control', 'placeholder' => 'Title']) }}

        </div>
    </div>
    <div class="col-sm-4">
        <div class="form-group">
            {{ Form::label('job_title', 'Job Title') }}
            {{ Form::text('job_title', $team->job_title, ['class' => 'form-control']) }}
        </div>
    </div>
    <div class="col-sm-4">
        <div class="form-group">
            {{ Form::label('linkedin_link', 'Linkedin link') }}
            {{ Form::text('linkedin_link', $team->linkedin_link, ['class' => 'form-control']) }}
        </div>
    </div>
</div>

{{-- <div class="row">
    <div class="col-sm-4">
        <div class="form-group">
            {{ Form::label('twitter_link', 'Twitter link') }}
            {{ Form::text('twitter_link', $team->twitter_link, ['class' => 'form-control']) }}
        </div>
    </div>
    <div class="col-sm-4">
        <div class="form-group">
            {{ Form::label('facebook_link', 'Facebook link') }}
            {{ Form::text('facebook_link', $team->facebook_link, ['class' => 'form-control']) }}
        </div>
    </div>
    <div class="col-sm-4">
        <div class="form-group">
            {{ Form::label('tumblr_link', 'Tumblr link') }}
            {{ Form::text('tumblr_link', $team->tumblr_link, ['class' => 'form-control']) }}
        </div>
    </div>
</div> --}}
