<?php

namespace App\Services;

use App\Models\ExamAttendance;
use App\Models\Student;

class ExamService
{
    public function examOut($student_id, $exam_type): bool
    {
        switch ($exam_type) {
            case 'alhan':
                $this->alhanAttendance($student_id);
                break;
            case 'coptic':
                $this->copticAttendance($student_id);
                break;
            case 'Coptic':
                $this->copticAttendance($student_id);
                break;
            case 'taks':
                $this->taksAttendance($student_id);
                break;
            case 'Taks':
                $this->taksAttendance($student_id);
                break;
            case 'agbeya':
                $this->agbeyaAttendance($student_id);
                break;
            case 'Agbeya':
                $this->agbeyaAttendance($student_id);
                break;
            default:
                break;
        }
        return true;
    }

    private function alhanAttendance($student_id): bool
    {
        $student_attendance = ExamAttendance::where('student_id', $student_id)->first();
        $student = Student::find($student_id);
        $student_attendance->alhan = 1;
        $student_attendance->save();
        return true;
    }

    private function copticAttendance($student_id): bool
    {
        $student_attendance = ExamAttendance::where('student_id', $student_id)->first();
        $student_attendance->coptic = 1;
        $student_attendance->save();
        return true;
    }

    private function taksAttendance($student_id): bool
    {
        $student_attendance = ExamAttendance::where('student_id', $student_id)->first();
        $student_attendance->taks = 1;
        $student_attendance->save();
        return true;
    }

    private function agbeyaAttendance($student_id): bool
    {
        $student_attendance = ExamAttendance::where('student_id', $student_id)->first();
        $student_attendance->agbeya = 1;
        $student_attendance->save();
        return true;
    }
}
