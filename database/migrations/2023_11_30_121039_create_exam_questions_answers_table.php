<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateExamQuestionsAnswersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('exam_questions_answers', function (Blueprint $table) {
            $table->id();
            $table->string('examiner');
            $table->string('wight');
            $table->string('score');
            $table->unsignedBigInteger("question_id")->nullable();
            $table->unsignedBigInteger("student_id")->nullable();
            $table->foreign("question_id")->references("id")->on("questions")->onDelete("cascade")->onUpdate("cascade");
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
        Schema::dropIfExists('exam_questions_answers');
    }
}
