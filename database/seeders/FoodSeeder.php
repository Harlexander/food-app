<?php

namespace Database\Seeders;

use App\Models\FoodPortionSize;
use App\Models\Foods;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FoodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Rice' => [
                [
                    'name' => 'Jollof Rice',
                    'description' => 'Spicy traditional rice',
                    'image' => '/food/jollof.png',
                    'portion_sizes' => [
                        'Large Cooler' => 150.0,
                        'Small Cooler' => 90.0,
                        'Full Pan' => 80.0,
                        'Half Pan' => 40.0,
                    ],
                ],
                [
                    'name' => 'Fried Rice (Vegetable)',
                    'description' => 'Nigerian vegetable fried rice with peas and carrots',
                    'image' => '/food/fried-rice.png',
                    'portion_sizes' => [
                        'Large Cooler' => 150.0,
                        'Small Cooler' => 90.0,
                        'Full Pan' => 80.0,
                        'Half Pan' => 40.0,
                    ],
                ],
                [
                    'name' => 'Fried Rice (Shrimp)',
                    'description' => 'Nigerian shrimp fried rice with peas and carrots',
                    'image' => '/food/fried-rice-shrimp.png',
                    'portion_sizes' => [
                        'Large Cooler' => 200.0,
                        'Small Cooler' => 125.0,
                        'Full Pan' => 90.0,
                        'Half Pan' => 50.0,
                    ],
                ],
                [
                    'name' => 'White Rice',
                    'description' => 'Parboiled',
                    'image' => '/food/white-rice.png',
                    'portion_sizes' => [
                        'Large Cooler' => 150.0,
                        'Small Cooler' => 90.0,
                        'Full Pan' => 80.0,
                        'Half Pan' => 40.0,
                    ],
                ],
            ],
            'Fufu' => [
                [
                    'name' => 'Pounded Yam',
                    'description' => 'Traditional Nigerian pounded yam, smooth and stretchy',
                    'image' => '/food/semo.png',
                    'portion_sizes' => [
                        'Party Size' => 2.0,
                        'Regular Size' => 4.0,
                    ],
                ],
                [
                    'name' => 'Eba',
                    'description' => 'Garri (cassava flakes) prepared with hot water',
                    'image' => '/food/eba.png',
                    'portion_sizes' => [
                        'Party Size' => 2.0,
                        'Regular Size' => 4.0,
                    ],
                ],
                [
                    'name' => 'Amala',
                    'description' => 'Yam flour fufu, dark and smooth',
                    'image' => '/food/amala.png',
                    'portion_sizes' => [
                        'Party Size' => 2.0,
                        'Regular Size' => 4.0,
                    ],
                ],
                [
                    'name' => 'Wheat',
                    'description' => 'Wheat flour fufu, soft and smooth',
                    'image' => '/food/wheat.png',
                    'portion_sizes' => [
                        'Party Size' => 2.0,
                        'Regular Size' => 4.0,
                    ],
                ],
            ],
            'Soup' => [
                [
                    'name' => 'Egusi with Mixed Meat',
                    'description' => 'Traditional melon seed soup with Beef, Chicken, Cow-Leg and/or Tripe',
                    'image' => '/food/egusi.png',
                    'portion_sizes' => [
                        'Large Cooler' => 550.0,
                        'Small Cooler' => 350.0,
                        'Full Pan' => 200.0,
                        'Half Pan' => 80.0,
                    ],
                ],
                [
                    'name' => 'Egusi with Fish or Goat',
                    'description' => 'Traditional melon seed soup with fish or goat meat',
                    'image' => '/food/egusi.png',
                    'portion_sizes' => [
                        'Large Cooler' => 550.0,
                        'Small Cooler' => 350.0,
                        'Full Pan' => 220.0,
                        'Half Pan' => 100.0,
                    ],
                ],
                [
                    'name' => 'Egusi with Stock Fish & Dry Fish',
                    'description' => 'Traditional melon seed soup with stock fish and dry fish',
                    'image' => '/food/egusi.png',
                    'portion_sizes' => [
                        'Large Cooler' => 550.0,
                        'Small Cooler' => 350.0,
                        'Full Pan' => 250.0,
                        'Half Pan' => 120.0,
                    ],
                ],
                [
                    'name' => 'Okro Soup',
                    'description' => 'Okro soup with assorted meats',
                    'image' => '/food/okro.png',
                    'portion_sizes' => [
                        'Large Cooler' => 500.0,
                        'Small Cooler' => 300.0,
                        'Full Pan' => 180.0,
                        'Half Pan' => 80.0,
                    ],
                ],
                [
                    'name' => 'Pepper Soup',
                    'description' => 'Spicy pepper soup with assorted meats',
                    'image' => '/food/pepper-soup.png',
                    'portion_sizes' => [
                        'Large Cooler' => 450.0,
                        'Small Cooler' => 280.0,
                        'Full Pan' => 160.0,
                        'Half Pan' => 70.0,
                    ],
                ],
                [
                    'name' => 'Vegetable Soup',
                    'description' => 'Rich vegetable soup with assorted meats',
                    'image' => '/food/vegetable.png',
                    'portion_sizes' => [
                        'Large Cooler' => 520.0,
                        'Small Cooler' => 320.0,
                        'Full Pan' => 200.0,
                        'Half Pan' => 90.0,
                    ],
                ],
                [
                    'name' => 'Gbegiri',
                    'description' => 'Bean soup with Beef, Chicken, Cow-Leg and/or Tripe',
                    'image' => '/food/gbegiri.png',
                    'portion_sizes' => [
                        'Half Pan' => 50.0,
                    ],
                ],
            ],
            'Meat' => [
                [
                    'name' => 'Beef',
                    'description' => 'Tender beef cuts, seasoned and cooked to perfection',
                    'portion_sizes' => [
                        'Large Cooler' => 1000.0,
                        'Small Cooler' => 500.0,
                        'Full Pan' => 250.0,
                        'Half Pan' => 125.0,
                    ],
                ],
                [
                    'name' => 'Chicken',
                    'description' => 'Succulent chicken pieces, well-seasoned',
                    'portion_sizes' => [
                        'Large Cooler' => 350.0,
                        'Small Cooler' => 180.0,
                        'Full Pan' => 100.0,
                        'Half Pan' => 50.0,
                    ],
                ],
                [
                    'name' => 'African Chicken',
                    'description' => 'Traditional African-style chicken with rich spices',
                    'portion_sizes' => [
                        'Large Cooler' => 450.0,
                        'Small Cooler' => 225.0,
                        'Full Pan' => 150.0,
                        'Half Pan' => 75.0,
                    ],
                ],
                [
                    'name' => 'Turkey',
                    'description' => 'Tender turkey pieces, seasoned and cooked',
                    'portion_sizes' => [
                        'Large Cooler' => 450.0,
                        'Small Cooler' => 225.0,
                        'Full Pan' => 150.0,
                        'Half Pan' => 75.0,
                    ],
                ],
            ],
            'Sides' => [
                [
                    'name' => 'Ewa Riro',
                    'description' => 'Stewed beans',
                    'portion_sizes' => [
                        'Large Cooler' => 500.0,
                        'Small Cooler' => 250.0,
                        'Full Pan' => 150.0,
                        'Half Pan' => 60.0,
                    ],
                ],
                [
                    'name' => 'Plantains (Fried)',
                    'description' => 'Sweet fried plantains, golden and crispy',
                    'portion_sizes' => [
                        'Full Pan' => 80.0,
                        'Half Pan' => 40.0,
                    ],
                ],
                [
                    'name' => 'Yam Porridge',
                    'description' => 'Yams simmered in special sauce with crayfish seasoning',
                    'portion_sizes' => [
                        'Large Cooler' => 350.0,
                        'Small Cooler' => 180.0,
                        'Full Pan' => 120.0,
                        'Half Pan' => 60.0,
                    ],
                ],
                [
                    'name' => 'Meat Pies',
                    'description' => 'Flaky pastry filled with seasoned meat',
                    'portion_sizes' => [
                        'Small Unit' => 2.0,
                        'Bigger Unit' => 3.0,
                    ],
                ],
            ],
        ];

        $sortOrder = 0;

        foreach ($categories as $category => $foods) {
            foreach ($foods as $foodData) {
                $food = Foods::create([
                    'name' => $foodData['name'],
                    'description' => $foodData['description'] ?? null,
                    'image' => $foodData['image'] ?? null,
                    'category' => $category,
                    'is_active' => true,
                    'sort_order' => $sortOrder++,
                ]);

                // Define sort order for portion sizes (larger sizes first, then smaller)
                $sizeSortOrder = [
                    'Large Cooler' => 1,
                    'Small Cooler' => 2,
                    'Full Pan' => 3,
                    'Half Pan' => 4,
                    'Party Size' => 1,
                    'Regular Size' => 2,
                    'Small Unit' => 2,
                    'Bigger Unit' => 1,
                ];

                $portionSortOrder = 0;
                foreach ($foodData['portion_sizes'] as $sizeName => $price) {
                    FoodPortionSize::create([
                        'food_id' => $food->id,
                        'size_name' => $sizeName,
                        'price' => $price,
                        'sort_order' => $sizeSortOrder[$sizeName] ?? ++$portionSortOrder,
                    ]);
                }
            }
        }
    }
}
