<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case CASH = 'cash';
    case POS = 'pos';
    case TRANSFER = 'transfer';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
