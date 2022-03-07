<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateExamAttendanceTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('exam_attendance', function (Blueprint $table) {
            $table->id();
            $table->boolean('in_hall');
            $table->boolean('alhan')->default(0);
            $table->boolean('coptic')->default(0);
            $table->boolean('taks')->default(0);
            $table->boolean('out_hall')->default(0);
            $table->unsignedBigInteger("student_id");
            $table->foreign("student_id")->references("id")->on("students")->onDelete("cascade")->onUpdate("cascade");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('exam_attendance');
    }
}
