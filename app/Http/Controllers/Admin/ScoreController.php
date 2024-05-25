<?php

namespace App\Http\Controllers\Admin;

use App\DataTables\ScoreViewDataTable;
use App\Http\Controllers\Controller;
use App\Models\ScoreView;
use Illuminate\Http\Request;

class ScoreController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(ScoreViewDataTable $dataTable)
    {
        return $dataTable->render('admin.dashboard.components.score.index');
    }
}
