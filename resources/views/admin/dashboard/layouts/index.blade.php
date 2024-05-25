@include('admin.dashboard.layouts.header')
<!-- Preloader -->

<div class="preloader flex-column justify-content-center align-items-center">
    <img class="animation__shake" src="{{ asset('styles/sdhds/dist/img/logo.svg') }}" alt="SDHDS Admin"
        height="60">
</div>

@include('admin.dashboard.layouts.nav')
@include('admin.dashboard.layouts.sidebar')
<div class="content-wrapper">
    @include('admin.dashboard.errors.fetchErrors')
    @include('admin.dashboard.success.success')
    @yield('content')
</div>
@include('admin.dashboard.layouts.footer')
