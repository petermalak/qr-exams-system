<?php

namespace App\Services;

use Carbon\Carbon;

class AttendanceService
{
    function isToday($arabicDate)
    {
        // Map Arabic month names to English month names
        $monthsMap = [
            'يناير' => 'January',
            'فبراير' => 'February',
            'مارس' => 'March',
            'أبريل' => 'April',
            'مايو' => 'May',
            'يونيو' => 'June',
            'يوليو' => 'July',
            'أغسطس' => 'August',
            'سبتمبر' => 'September',
            'أكتوبر' => 'October',
            'نوفمبر' => 'November',
            'ديسمبر' => 'December',
        ];

        // Replace Arabic month names with English equivalents
        foreach ($monthsMap as $arabic => $english) {
            if (str_contains($arabicDate, $arabic)) {
                $arabicDate = str_replace($arabic, $english, $arabicDate);
                break;
            }
        }

        // Convert the formatted string to a Carbon date
        try {
            $date = Carbon::createFromFormat('l d F', $arabicDate);

            // Check if the parsed date matches today
            return $date->isToday();
        } catch (\Exception $e) {
            return false; // Handle invalid dates
        }
    }
}
