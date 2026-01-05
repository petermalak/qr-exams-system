@extends('admin.layouts.index')
@section('content')
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1>Teams</h1>
                </div>
                <div class="col-sm-4">
                </div>
                <div class="col-sm-2">
                    <a href="{{ route('teams.create') }}" type="button" class="btn btn-block btn-primary btn-md">Create
                        Team</a>
                </div>
            </div>
        </div><!-- /.container-fluid -->
    </section>

    <!-- Main content -->
    <section class="content">

        <!-- Default box -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Teams</h3>

                <div class="card-tools">
                    <button type="button" class="btn btn-tool" data-card-widget="collapse" title="Collapse">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button type="button" class="btn btn-tool" data-card-widget="remove" title="Remove">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="card-body p-0">
                <table class="table table-striped projects">
                    <thead>
                        <tr>
                            <th style="width: 1%">
                                #
                            </th>
                            <th style="width: 20%">
                                Name
                            </th>
                            <th style="width: 20%">
                                Job Title
                            </th>
                            {{-- <th style="width: 20%">
                                Facebook link
                            </th>
                            <th style="width: 20%">
                                Twitter link
                            </th> --}}
                            <th style="width: 20%">
                                Linkedin link
                            </th>
                            {{-- <th style="width: 20%">
                                Tumbler link
                            </th> --}}
                            <th style="width: 20%">
                                Image
                            </th>
                            <th style="width: 19%">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($teams as $team)
                            <tr>
                                <td>
                                    {{ $team->id }}
                                </td>
                                <td>
                                    <span>
                                        {{ $team->name }}
                                    </span>
                                </td>
                                <td class="project_progress">
                                    <span>
                                        {{ $team->job_title }}
                                    </span>
                                </td>
                                {{-- <td>
                                    <span>
                                        {{ $team->facebook_link }}
                                    </span>
                                </td>
                                <td>
                                    <span>
                                        {{ $team->twitter_link }}
                                    </span>
                                </td> --}}
                                <td>
                                    <span>
                                        {{ $team->linkedin_link }}
                                    </span>
                                </td>
                                {{-- <td>
                                    <span>
                                        {{ $team->tumblr_link }}
                                    </span>
                                </td> --}}
                                <td>
                                    <span>
                                        {{ $team->image_id }}
                                    </span>
                                </td>
                                <td class="project-actions">
                                    @include('admin.components.table.actions', [
                                        'page' => 'teams',
                                        'data' => $team,
                                    ])
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <!-- /.card-body -->
        </div>
        <!-- /.card -->
        {{-- Pagination --}}
        <div class="d-flex justify-content-center">
            {!! $teams->links() !!}
        </div>

    </section>
    <!-- /.content -->
@endsection
