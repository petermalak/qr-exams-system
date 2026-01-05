<!-- Footer -->

<footer class="main-footer">
    <strong>Copyright &copy; {{ date('Y') }} <a href="">PB</a>.</strong>
    All rights reserved.
</footer>

<!-- Control Sidebar -->
{{-- <aside class="control-sidebar control-sidebar-dark"> --}}
{{-- <!-- Control sidebar content goes here --> --}}
{{-- </aside> --}}
<!-- /.control-sidebar -->
</div>
<!-- ./wrapper -->

<!-- jQuery -->
<script src="{{ asset('/styles/sdhds/plugins/jquery/jquery.min.js') }}"></script>
<!-- jQuery UI 1.11.4 -->
<script src="{{ asset('/styles/sdhds/plugins/jquery-ui/jquery-ui.min.js') }}"></script>
<!-- Resolve conflict in jQuery UI tooltip with Bootstrap tooltip -->
<script>
    $.widget.bridge('uibutton', $.ui.button)
</script>
<!-- Bootstrap 4 -->
<script src="{{ asset('/styles/sdhds/plugins/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
<!-- ChartJS -->
<script src="{{ asset('/styles/sdhds/plugins/chart.js/Chart.min.js') }}"></script>
<!-- Sparkline -->
<script src="{{ asset('/styles/sdhds/plugins/sparklines/sparkline.js') }}"></script>
<!-- JQVMap -->
<script src="{{ asset('/styles/sdhds/plugins/jqvmap/jquery.vmap.min.js') }}"></script>
<script src="{{ asset('/styles/sdhds/plugins/jqvmap/maps/jquery.vmap.world.js') }}"></script>
<!-- jQuery Knob Chart -->
<script src="{{ asset('/styles/sdhds/plugins/jquery-knob/jquery.knob.min.js') }}"></script>
<!-- daterangepicker -->
<script src="{{ asset('/styles/sdhds/plugins/moment/moment.min.js') }}"></script>
<script src="{{ asset('/styles/sdhds/plugins/daterangepicker/daterangepicker.js') }}"></script>
<!-- Tempusdominus Bootstrap 4 -->
<script src="{{ asset('/styles/sdhds/plugins/tempusdominus-bootstrap-4/js/tempusdominus-bootstrap-4.min.js') }}">
</script>
<!-- Summernote -->
<script src="{{ asset('/styles/sdhds/plugins/summernote/summernote-bs4.min.js') }}"></script>
<!-- overlayScrollbars -->
<script src="{{ asset('/styles/sdhds/plugins/overlayScrollbars/js/jquery.overlayScrollbars.min.js') }}"></script>
<!-- adminLTE App -->
<script src="{{ asset('/styles/sdhds/dist/js/adminlte.js') }}"></script>
<!-- sdhdsLTE for demo purposes -->
<script src="{{ asset('/styles/sdhds/dist/js/demo.js') }}"></script>
<!-- sdhdsLTE dashboard demo (This is only for demo purposes) -->
<script src="{{ asset('/styles/sdhds/dist/js/pages/dashboard.js') }}"></script>
<script src="//cdn.datatables.net/1.11.1/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js" defer></script>

@stack('scripts')
</body>

</html>
