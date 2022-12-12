<?php

namespace App\Console\Commands;

use App\Models\Student;
use Illuminate\Console\Command;

class adding_class_id extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'class:id';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $students = Student::all();
        foreach ($students as $student){
            $student->class_id = rand(1,10);
            $student->save();
        }
    }
}
