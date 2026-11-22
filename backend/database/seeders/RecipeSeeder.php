<?php

namespace Database\Seeders;

use App\Models\Recipe;
use Illuminate\Database\Seeder;

class RecipeSeeder extends Seeder
{
    public function run(): void
    {
        $recipes = [
            [
                'slug'             => 'mafe-authentique-boeuf',
                'title'            => "L'Authentique Mafé au Bœuf & Tomat'Chef",
                'subtitle'         => "Une sauce onctueuse veloutée à la pâte d'arachide et concentré de tomate mijoté",
                'category'         => 'Africaine',
                'prep_time'        => '25 min',
                'cook_time'        => '1h 15 min',
                'difficulty'       => 'Moyen',
                'servings'         => 6,
                'tomato_quantity'   => "4 cuillères à soupe généreuses (environ 120g de Tomat'Chef)",
                'image'            => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
                'featured'         => true,
                'ingredients'      => [
                    ['name' => "Concentré de tomate Tomat'Chef (Bouteille 750g)", 'amount' => '120g', 'isTomatoPaste' => true],
                    ['name' => "Pâte d'arachide pure non sucrée", 'amount' => '150g'],
                    ['name' => 'Morceaux de paleron ou gîte de bœuf', 'amount' => '800g'],
                    ['name' => 'Oignons jaunes émincés', 'amount' => '2 gros oignons'],
                    ['name' => 'Gousses d\'ail pilées avec poivre noir', 'amount' => '4 gousses'],
                    ['name' => 'Carottes, patate douce et manioc', 'amount' => '500g'],
                    ['name' => 'Bouillon de bœuf maison', 'amount' => '1 litre'],
                    ['name' => 'Piment habanero entier (sans percer)', 'amount' => '1 pièce'],
                    ['name' => 'Huile d\'arachide ou de tournesol', 'amount' => '3 cuillères à soupe'],
                ],
                'steps'            => [
                    "Dans une grande cocotte en fonte, faites dorer les morceaux de viande de bœuf dans l'huile chaude jusqu'à belle coloration.",
                    "Ajoutez les oignons émincés et l'ail écrasé. Laissez suer 5 minutes sans brûler.",
                    "Incorporez le concentré de tomate Tomat'Chef. Faites-le frire doucement pendant 3 à 4 minutes en remuant sans arrêt pour concentrer les sucres naturels et sublimer la couleur rouge.",
                    "Mouillez avec le bouillon chaud, couvrez et laissez frémir pendant 35 minutes.",
                    "Diluez la pâte d'arachide dans un bol de sauce chaude, puis reversez le mélange dans la cocotte.",
                    "Ajoutez les légumes taillés en gros morceaux et le piment entier. Laissez mijoter à feu doux 30 minutes jusqu'à ce que l'huile remonte délicatement en surface.",
                    "Servez très chaud avec un riz blanc cassé parfumé.",
                ],
                'chef_notes'       => "Faire rissoler légèrement le concentré Tomat'Chef avec les oignons avant d'ajouter le liquide décuple les arômes de tomate mûrie et donne une sauce au brillant satiné.",
                'nutrition_highlight' => "Extrêmement riche en lycopène et en protéines saines grâce à l'association tomate concentrée et arachide.",
                'is_published'     => true,
            ],
            [
                'slug'             => 'thieboudienne-rouge-royale',
                'title'            => 'Thiéboudienne Rouge Royale (Ceebu Jën)',
                'subtitle'         => 'Le plat national sénégalais réputé pour son riz rouge infusé d\'essence de tomate',
                'category'         => 'Africaine',
                'prep_time'        => '30 min',
                'cook_time'        => '1h 30 min',
                'difficulty'       => 'Expert',
                'servings'         => 8,
                'tomato_quantity'   => "150g de Tomat'Chef",
                'image'            => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
                'featured'         => true,
                'ingredients'      => [
                    ['name' => "Concentré Tomat'Chef", 'amount' => '150g', 'isTomatoPaste' => true],
                    ['name' => 'Riz brisé parfumé', 'amount' => '800g'],
                    ['name' => 'Gros poisson blanc (Mérou ou Carpe rouge)', 'amount' => '1.2kg'],
                    ['name' => 'Farce herbes & piment (Roff)', 'amount' => '1 bol'],
                    ['name' => 'Chou blanc, carottes, aubergine africaine', 'amount' => '600g'],
                    ['name' => 'Tamarin et yet / nététou', 'amount' => 'Selon convenance'],
                ],
                'steps'            => [
                    "Piquez la chair du poisson et insérez le 'Roff' maison aux herbes.",
                    "Saisissez le poisson dans l'huile, réservez. Dans la même huile, faites revenir les oignons et la tomate concentrée Tomat'Chef.",
                    "Laissez caraméliser la tomate pour donner la signature rouge profond caractéristique du riz.",
                    "Ajoutez l'eau et les légumes. Laissez cuire les légumes puis retirez-les.",
                    "Versez le riz lavé et pré-cuit à la vapeur dans le bouillon aromatisé. Cuire à feu très doux jusqu'à absorption complète.",
                ],
                'chef_notes'       => "La pureté de Tomat'Chef sans acidité artificielle garantit un riz qui ne colle pas et conserve une teinte rouge flamboyante.",
                'nutrition_highlight' => "Riche en minéraux, potassium et vitamine A apportés par les légumes cuits dans le bouillon de tomate.",
                'is_published'     => true,
            ],
            [
                'slug'             => 'shakshuka-epicee-oeufs',
                'title'            => 'Shakshuka Épicée aux Œufs Fermiers Coulants',
                'subtitle'         => 'Poivrons confits, cumin toasté et tomates concentrées fondantes',
                'category'         => 'Méditerranéenne',
                'prep_time'        => '15 min',
                'cook_time'        => '25 min',
                'difficulty'       => 'Facile',
                'servings'         => 4,
                'tomato_quantity'   => "3 cuillères à soupe (80g de Tomat'Chef)",
                'image'            => 'https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=800&q=80',
                'featured'         => false,
                'ingredients'      => [
                    ['name' => "Concentré de tomate Tomat'Chef", 'amount' => '80g', 'isTomatoPaste' => true],
                    ['name' => 'Poivrons rouges et jaunes émincés', 'amount' => '3 pièces'],
                    ['name' => 'Tomates fraîches concassées', 'amount' => '400g'],
                    ['name' => 'Œufs bio plein air', 'amount' => '4 à 5 pièces'],
                    ['name' => 'Cumin en graines, coriandre et paprika doux', 'amount' => '2 cuillères à café'],
                    ['name' => 'Fromage feta émietté et coriandre fraîche', 'amount' => 'Pour la finition'],
                ],
                'steps'            => [
                    "Faites revenir l'ail et les poivrons dans de l'huile d'olive jusqu'à ce qu'ils soient fondants.",
                    "Ajoutez les épices puis délayez le concentré Tomat'Chef au milieu de la poêle pour le torréfier 2 minutes.",
                    "Ajoutez les tomates concassées et un demi-verre d'eau. Laissez compoter 12 minutes à feu moyen.",
                    "Creusez de petits puits dans la sauce et cassez-y les œufs entiers.",
                    "Couvrez 4 à 6 minutes jusqu'à ce que le blanc soit pris mais le jaune encore bien crémeux.",
                    "Garnissez de feta, de coriandre et dégustez avec du pain chaud au levain.",
                ],
                'chef_notes'       => "Ajoutez une pointe de concentré piment doux Tomat'Chef pour un peps incomparable.",
                'nutrition_highlight' => "Haute biodisponibilité du lycopène grâce aux lipides de l'huile d'olive et du jaune d'œuf.",
                'is_published'     => true,
            ],
            [
                'slug'             => 'sauce-tomate-napolitaine',
                'title'            => 'Sauce Tomate Napolitaine Mijotée 2 Heures',
                'subtitle'         => "L'essence de la tomate douce avec basilic frais, ail confit et huile d'olive vierge",
                'category'         => 'Méditerranéenne',
                'prep_time'        => '10 min',
                'cook_time'        => '2h 00 min',
                'difficulty'       => 'Facile',
                'servings'         => 6,
                'tomato_quantity'   => "1 bouteille 750g Tomat'Chef",
                'image'            => 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=800&q=80',
                'featured'         => false,
                'ingredients'      => [
                    ['name' => "Bouteille Verre 750g Tomat'Chef", 'amount' => '1 bouteille', 'isTomatoPaste' => true],
                    ['name' => "Huile d'olive extra vierge première pression", 'amount' => '6 cuillères à soupe'],
                    ['name' => 'Gousses d\'ail écrasées', 'amount' => '4 gousses'],
                    ['name' => 'Bouquet de basilic frais à larges feuilles', 'amount' => '1 gros bouquet'],
                    ['name' => 'Eau de source', 'amount' => '500ml'],
                    ['name' => 'Sel de mer et poivre blanc du moulin', 'amount' => 'Selon goût'],
                ],
                'steps'            => [
                    "Chauffez doucement l'huile d'olive avec les gousses d'ail entières écrasées pour infuser l'huile.",
                    "Versez la bouteille de Tomat'Chef. La texture onctueuse et la couleur foncée apportent immédiatement une base dense.",
                    "Ajoutez l'eau de source pour allonger la sauce tout en douceur.",
                    "Laissez mijoter à frémissement très doux pendant 1h30 à découvert en remuant de temps en temps.",
                    "En fin de cuisson, retirez du feu et plongez les feuilles de basilic déchirées à la main.",
                    "Servez sur des tagliatelles fraîches ou garnissez vos pizzas maison.",
                ],
                'chef_notes'       => "Ne mettez pas de sucre ! Grâce au soleil naturel emmagasiné dans les tomates de Tomat'Chef, l'équilibre acide/sucre est déjà parfait.",
                'nutrition_highlight' => "100% végétal, antioxydant puissant, sans aucun additif ni conservateur.",
                'is_published'     => true,
            ],
        ];

        foreach ($recipes as $data) {
            Recipe::updateOrCreate(['slug' => $data['slug']], $data);
        }
    }
}
