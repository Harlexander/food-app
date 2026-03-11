<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategoryExtra extends Model
{
    protected $fillable = [
        'category',
        'name',
        'price',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'sort_order' => 'integer',
        ];
    }
}
