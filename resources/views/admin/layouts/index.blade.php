@include('admin.layouts.header')
<div class="content-wrapper">
    @include('admin.errors.fetchErrors')
    @include('admin.success.success')
    @yield('content')
</div>
@include('admin.layouts.footer')
