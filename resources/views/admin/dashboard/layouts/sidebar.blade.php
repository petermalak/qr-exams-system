<!-- Main Sidebar Container -->
<aside class="main-sidebar sidebar-dark-primary elevation-4">
    <!-- Brand Logo -->
    <a href="{{ route('dashboard') }}" class="brand-link" style="height:60px ;padding-top: 15px;">
        <img src="{{ asset('styles/sdhds/dist/img/logo.svg') }}" alt="SDHDS Admin" class="brand-image">
    </a>

    <!-- Sidebar -->
    <div class="sidebar" style="padding-top: 20px;">
        <!-- SidebarSearch Form -->
        <div class="form-inline">
            <div class="input-group" data-widget="sidebar-search">
                <input class="form-control form-control-sidebar" type="search" placeholder="Search"
                    aria-label="Search">
                <div class="input-group-append">
                    <button class="btn btn-sidebar">
                        <i class="fas fa-search fa-fw"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Sidebar Menu -->
        <nav class="mt-2">
            <ul class="nav nav-pills nav-sidebar flex-column nav-child-indent" data-widget="treeview" role="menu"
                data-accordion="false">

                <li class="nav-item">
                    <a href="{{ route('scores.index') }}"
                        class="nav-link {{ areActiveRoutes(['scores.index']) }}">
                        <i class="nav-icon fas fa-table"></i>
                        <p>Score</p>
                    </a>
                </li>
                
            </ul>
        </nav>
        <!-- /.sidebar-menu -->
    </div>
    <!-- /.sidebar -->
</aside>
