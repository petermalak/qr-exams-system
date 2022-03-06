@include("admin.layouts.header")
<!-- Preloader -->

{{--<div class="preloader flex-column justify-content-center align-items-center">--}}
{{--    <img class="animation__shake" src="/styles/admin/dist/img/logo.png" alt="AdminLTELogo" height="60">--}}
{{--</div>--}}

<div class="content-wrapper">
    @include("admin.errors.fetchErrors")
    @include("admin.success.success")
    @yield('content')
</div>
@include("admin.layouts.footer")
