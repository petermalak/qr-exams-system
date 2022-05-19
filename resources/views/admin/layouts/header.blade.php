<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    {{-- <title>@yield("title", title())</title> --}}

    <meta name="csrf-token" content="{{csrf_token()}}">
    <link rel="icon" href="/admin/dist/img/favicon.png"/>

    <!-- Google Font: Source Sans Pro -->
    <link rel="stylesheet"
          href="/admin/googleFonts.css">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="/admin/plugins/fontawesome-free/css/all.min.css">
    <!-- Ionicons -->
    <link rel="stylesheet" href="/admin/ionicons.min.css">
    <!-- Tempusdominus Bootstrap 4 -->
    <link rel="stylesheet" href="/admin/plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css">
    <!-- iCheck -->
    <link rel="stylesheet" href="/admin/plugins/icheck-bootstrap/icheck-bootstrap.min.css">
    <!-- JQVMap -->
    <link rel="stylesheet" href="/admin/plugins/jqvmap/jqvmap.min.css">
    <!-- Theme style -->
    <link rel="stylesheet" href="/admin/dist/css/adminlte.min.css">
    <!-- overlayScrollbars -->
    <link rel="stylesheet" href="/admin/plugins/overlayScrollbars/css/OverlayScrollbars.min.css">
    <!-- Daterange picker -->
    <link rel="stylesheet" href="/admin/plugins/daterangepicker/daterangepicker.css">
    <!-- summernote -->
    <link rel="stylesheet" href="/admin/plugins/summernote/summernote-bs4.min.css">
    <link href="/admin/dropzone.min.css" rel="stylesheet"/>
    <script src="/admin/jquery.min.js"></script>
    <script src="/admin/dropzone.min.js"></script>
    <link rel="stylesheet" href="/admin/jquery.dataTables.min.css">
    <link href="/admin/select2.min.css" rel="stylesheet"/>
    <link rel="stylesheet"
          href="/admin/select2-bootstrap4.min.css">

    <!-- Custom style -->
    <link rel="stylesheet" href="/admin/dist/css/custom.css">
    @stack("styles")
</head>
<body class="hold-transition layout-top-nav">
<div class="wrapper">
