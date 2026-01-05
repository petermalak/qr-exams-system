<?php

namespace App\Services;

use Carbon\Carbon;

class AttendanceService
{
    static function parseArabicDate($arabicDate)
    {
        $months = [
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

        $parts = explode(' ', $arabicDate); // e.g., ["الجمعة", "13", "ديسمبر"]
        $day = $parts[1]; // "13"
        $month = $months[$parts[2]]; // Convert "ديسمبر" to "December"

        $formattedDate = "$day $month " . date('Y'); // e.g., "13 December 2024"
        return \DateTime::createFromFormat('d F Y', $formattedDate);
    }
}
