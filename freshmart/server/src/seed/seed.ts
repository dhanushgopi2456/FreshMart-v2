import { connectDB, disconnectDB } from '../config/database.js'
import { Category } from '../models/Category.js'
import { Product } from '../models/Product.js'
import { Coupon } from '../models/Coupon.js'
import { logger } from '../utils/logger.js'

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`

const categories = [
  { name: 'Fruits', slug: 'fruits', description: 'Handpicked seasonal & exotic fruits', icon: 'Apple', sortOrder: 1, image: img('photo-1610832958506-aa56368176cf') },
  { name: 'Vegetables', slug: 'vegetables', description: 'Farm-fresh everyday vegetables', icon: 'Carrot', sortOrder: 2, image: img('photo-1540420773420-3366772f4999') },
  { name: 'Dairy & Eggs', slug: 'dairy-eggs', description: 'Milk, cheese, curd & farm eggs', icon: 'Milk', sortOrder: 3, image: img('photo-1550583724-b2692b85b150') },
  { name: 'Bakery', slug: 'bakery', description: 'Breads, buns & baked goodness', icon: 'Croissant', sortOrder: 4, image: img('photo-1509440159596-0249088772ff') },
  { name: 'Beverages', slug: 'beverages', description: 'Juices, cold drinks & hydration', icon: 'CupSoda', sortOrder: 5, image: img('photo-1544145945-f90425340c7e') },
  { name: 'Snacks', slug: 'snacks', description: 'Chips, namkeen & munchies', icon: 'Cookie', sortOrder: 6, image: img('photo-1621939514649-280e2ee25f60') },
  { name: 'Meat & Seafood', slug: 'meat-seafood', description: 'Fresh cuts & seafood', icon: 'Fish', sortOrder: 7, image: img('photo-1607623814075-e51df1bdc82f') },
  { name: 'Household', slug: 'household', description: 'Cleaning & daily essentials', icon: 'SprayCan', sortOrder: 8, image: img('photo-1585421514738-01798e348b17') },
  { name: 'Personal Care', slug: 'personal-care', description: 'Bath, skin & hair care', icon: 'Sparkles', sortOrder: 9, image: img('photo-1556228720-195a672e8a03') },
]

interface SeedProduct {
  name: string
  slug: string
  description: string
  brand: string
  price: number
  discountPrice?: number
  stock: number
  minStock?: number
  unit: string
  images: string[]
  isFeatured?: boolean
  isBestSeller?: boolean
  rating: number
  reviewCount: number
}

const productData: SeedProduct[] = [
  { name: 'Organic Royal Gala Apples', slug: 'organic-royal-gala-apples', description: 'Crisp, sweet and juicy organic gala apples handpicked from Himalayan orchards. Rich in fiber and antioxidants.', brand: 'FreshFarm', price: 240, discountPrice: 150, stock: 120, minStock: 15, unit: '1 kg', images: [img('photo-1560806887-1e4cd0b6cbd6'), img('photo-1570913149827-d2ac84ab3f9a')], isFeatured: true, isBestSeller: true, rating: 4.8, reviewCount: 412 },
  { name: 'Kashmiri Honey Pears', slug: 'kashmiri-honey-pears', description: 'Soft, aromatic pears with a delicate honey sweetness. Perfect for salads and desserts.', brand: 'FreshFarm', price: 280, discountPrice: 220, stock: 60, minStock: 12, unit: '1 kg', images: [img('photo-1515448863551-7729bcb9d523'), img('photo-1542428344-b18e1a2c0d9d')], isFeatured: true, rating: 4.6, reviewCount: 198 },
  { name: 'Nashik Seedless Grapes', slug: 'nashik-seedless-grapes', description: 'Plump, juicy seedless grapes from the vineyards of Nashik. A refreshing everyday snack.', brand: 'FreshFarm', price: 120, discountPrice: 90, stock: 90, minStock: 15, unit: '500 g', images: [img('photo-1537640538966-79f369143f8f')], isBestSeller: true, rating: 4.7, reviewCount: 356 },
  { name: 'Alphonso Mangoes', slug: 'alphonso-mangoes', description: 'The king of mangoes — saffron-hued, creamy and intensely aromatic Alphonso from Ratnagiri.', brand: 'FreshFarm', price: 899, discountPrice: 749, stock: 45, minStock: 10, unit: '1 kg', images: [img('photo-1553279768-865429fa0078')], isFeatured: true, rating: 4.9, reviewCount: 523 },
  { name: 'Bananas Robusta', slug: 'bananas-robusta', description: 'Naturally ripened Robusta bananas, a rich source of potassium and instant energy.', brand: 'FreshFarm', price: 45, stock: 200, minStock: 25, unit: '1 dozen', images: [img('photo-1571771894821-ce9b6c11b08e')], isBestSeller: true, rating: 4.5, reviewCount: 289 },
  { name: 'California Strawberries', slug: 'california-strawberries', description: 'Bright red, juicy strawberries packed with vitamin C. Great for smoothies and breakfast bowls.', brand: 'FreshFarm', price: 150, discountPrice: 110, stock: 0, minStock: 10, unit: '250 g', images: [img('photo-1464965911861-746a04b4bca6')], rating: 4.7, reviewCount: 234 },
  { name: 'Fresh Spinach (Palak)', slug: 'fresh-spinach-palak', description: 'Deep-green, tender spinach leaves harvested daily. Packed with iron and folate.', brand: 'FarmVeg', price: 25, stock: 150, minStock: 20, unit: '1 bunch', images: [img('photo-1576045057995-568f588f82fb')], rating: 4.4, reviewCount: 178 },
  { name: 'Hybrid Tomatoes', slug: 'hybrid-tomatoes', description: 'Firm, ripe tomatoes ideal for curries, salads and chutneys.', brand: 'FarmVeg', price: 35, discountPrice: 25, stock: 180, minStock: 20, unit: '500 g', images: [img('photo-1561136594-7f68413baa99')], isBestSeller: true, rating: 4.6, reviewCount: 301 },
  { name: 'Organic Potatoes', slug: 'organic-potatoes', description: 'Smooth-skinned organic potatoes, versatile for cooking, frying and roasting.', brand: 'FarmVeg', price: 45, stock: 250, minStock: 25, unit: '1 kg', images: [img('photo-1518977676601-b53f82aba655')], rating: 4.5, reviewCount: 267 },
  { name: 'Fresh Red Onions', slug: 'fresh-red-onions', description: 'Pungent red onions that form the base of every Indian kitchen.', brand: 'FarmVeg', price: 32, stock: 220, minStock: 25, unit: '1 kg', images: [img('photo-1518977956812-cd3dbadaaf31')], isBestSeller: true, rating: 4.3, reviewCount: 320 },
  { name: 'Green Capsicum', slug: 'green-capsicum', description: 'Crunchy, mild green capsicum for stir-fries, pizzas and salads.', brand: 'FarmVeg', price: 60, discountPrice: 45, stock: 70, minStock: 12, unit: '500 g', images: [img('photo-1563565375-f3fdfdbefa83')], rating: 4.5, reviewCount: 154 },
  { name: 'Organic Broccoli', slug: 'organic-broccoli', description: 'Freshly cut broccoli florets, a superfood rich in vitamins and fiber.', brand: 'FarmVeg', price: 95, discountPrice: 80, stock: 40, minStock: 8, unit: '500 g', images: [img('photo-1459411621453-7b03977f4bfc')], isFeatured: true, rating: 4.7, reviewCount: 198 },
  { name: 'Farm Eggs (Pack of 12)', slug: 'farm-eggs-pack-12', description: 'Protein-rich farm-fresh eggs from free-range hens, verified for quality.', brand: 'Amul Farms', price: 96, stock: 300, minStock: 30, unit: '12 pieces', images: [img('photo-1582722872445-44dc5f7e3c8f')], isBestSeller: true, rating: 4.8, reviewCount: 678 },
  { name: 'Toned Milk 500ml', slug: 'toned-milk-500ml', description: 'Pasteurized toned milk with 3% fat, delivered chilled and fresh daily.', brand: 'Amul', price: 30, stock: 400, minStock: 40, unit: '500 ml', images: [img('photo-1550583724-b2692b85b150')], isBestSeller: true, rating: 4.6, reviewCount: 890 },
  { name: 'Paneer (Fresh) 200g', slug: 'paneer-fresh-200g', description: 'Soft, fresh cottage cheese blocks, perfect for curries, grills and desserts.', brand: 'Amul', price: 85, discountPrice: 75, stock: 120, minStock: 20, unit: '200 g', images: [img('photo-1631452180519-c014fe946bc7')], isFeatured: true, rating: 4.8, reviewCount: 434 },
  { name: 'Greek Yogurt 400g', slug: 'greek-yogurt-400g', description: 'Thick, creamy Greek-style yogurt — high in protein and gut-friendly cultures.', brand: 'Epigamia', price: 145, discountPrice: 120, stock: 80, minStock: 15, unit: '400 g', images: [img('photo-1488477181946-6428a0291777')], rating: 4.7, reviewCount: 256 },
  { name: 'Cheddar Cheese Slices', slug: 'cheddar-cheese-slices', description: 'Smooth melting cheddar cheese slices for sandwiches and burgers.', brand: 'Amul', price: 175, stock: 95, minStock: 15, unit: '200 g', images: [img('photo-1486297678162-eb2a19b0a32d')], rating: 4.6, reviewCount: 178 },
  { name: 'Whole Wheat Bread', slug: 'whole-wheat-bread', description: 'Soft whole wheat sandwich bread, baked fresh with zero maida.', brand: 'Harvest Gold', price: 42, discountPrice: 35, stock: 140, minStock: 20, unit: '400 g', images: [img('photo-1509440159596-0249088772ff')], isBestSeller: true, rating: 4.5, reviewCount: 421 },
  { name: 'Multigrain Pav Buns (6 pcs)', slug: 'multigrain-pav-buns-6', description: 'Fluffy multigrain pav buns, perfect for vada pav and sliders.', brand: 'Harvest Gold', price: 55, stock: 90, minStock: 12, unit: '6 pieces', images: [img('photo-1608198093002-ad4e005484ec')], rating: 4.4, reviewCount: 123 },
  { name: 'Butter Croissants (2 pcs)', slug: 'butter-croissants-2', description: 'Flaky, golden butter croissants baked in-house every morning.', brand: 'FreshBakery', price: 120, stock: 40, minStock: 8, unit: '2 pieces', images: [img('photo-1555507036-ab1f4038808a')], isFeatured: true, rating: 4.8, reviewCount: 201 },
  { name: 'Chocolate Chip Cookies', slug: 'chocolate-chip-cookies', description: 'Crisp-edged, chewy-centered cookies loaded with dark chocolate chips.', brand: 'Britannia', price: 80, discountPrice: 65, stock: 160, minStock: 20, unit: '250 g', images: [img('photo-1499636136210-6f4ee915583e')], isBestSeller: true, rating: 4.6, reviewCount: 388 },
  { name: 'Cold Pressed Orange Juice', slug: 'cold-pressed-orange-juice', description: '100% cold-pressed orange juice with no added sugar or preservatives.', brand: 'Raw Pressery', price: 160, discountPrice: 135, stock: 110, minStock: 15, unit: '1 L', images: [img('photo-1600271886742-f049cd451bba')], rating: 4.7, reviewCount: 245 },
  { name: 'Masala Chai Premix', slug: 'masala-chai-premix', description: 'Bold assam tea blended with ginger, cardamom and cinnamon spices.', brand: 'Tata Tea', price: 220, stock: 130, minStock: 20, unit: '250 g', images: [img('photo-1561336313-0bd5e0b27ec8')], isBestSeller: true, rating: 4.7, reviewCount: 467 },
  { name: 'Coconut Water', slug: 'coconut-water', description: 'Natural tender coconut water, a perfect post-workout hydration.', brand: 'Raw Pressery', price: 110, stock: 200, minStock: 25, unit: '1 L', images: [img('photo-1506084868230-bb9d95c24759')], rating: 4.5, reviewCount: 189 },
  { name: 'Filter Coffee Powder', slug: 'filter-coffee-powder', description: 'Aromatic South Indian filter coffee blend with chicory.', brand: 'Nescafé', price: 340, discountPrice: 299, stock: 75, minStock: 12, unit: '500 g', images: [img('photo-1447933601403-0c6688de566e')], rating: 4.8, reviewCount: 312 },
  { name: 'Salted Potato Chips', slug: 'salted-potato-chips', description: 'Classic salted potato chips made from real potatoes, crispy and light.', brand: 'Lay\'s', price: 50, discountPrice: 40, stock: 300, minStock: 30, unit: '90 g', images: [img('photo-1566478989037-eec170784d0b')], isBestSeller: true, rating: 4.4, reviewCount: 745 },
  { name: 'Roasted Almonds', slug: 'roasted-almonds', description: 'Salted roasted almonds, a healthy protein-rich snack.', brand: 'Tata Sampann', price: 190, discountPrice: 165, stock: 140, minStock: 20, unit: '250 g', images: [img('photo-1508061253366-f7da158b6d46')], rating: 4.7, reviewCount: 298 },
  { name: 'Organic Muesli', slug: 'organic-muesli', description: 'Crunchy muesli with oats, nuts and dried fruits for a wholesome breakfast.', brand: 'Kellogg\'s', price: 280, discountPrice: 235, stock: 85, minStock: 12, unit: '500 g', images: [img('photo-1517673400267-0251440c45dc')], isFeatured: true, rating: 4.6, reviewCount: 177 },
  { name: 'Makhana (Fox Nuts)', slug: 'makhana-fox-nuts', description: 'Roasted fox nuts, a light and crunchy low-calorie snack.', brand: 'Phool', price: 150, stock: 160, minStock: 20, unit: '200 g', images: [img('photo-1599599810769-bcde5a160d32')], rating: 4.5, reviewCount: 143 },
  { name: 'Chicken Breast (Boneless)', slug: 'chicken-breast-boneless', description: 'Antibiotic-free boneless chicken breast, trimmed and chilled.', brand: 'FreshCut', price: 340, discountPrice: 299, stock: 50, minStock: 10, unit: '500 g', images: [img('photo-1604503468506-a8da13d82791')], isFeatured: true, rating: 4.7, reviewCount: 312 },
  { name: 'Salmon Fillet', slug: 'salmon-fillet', description: 'Premium Norwegian salmon fillet, rich in omega-3 fatty acids.', brand: 'FreshCut', price: 899, discountPrice: 799, stock: 30, minStock: 6, unit: '400 g', images: [img('photo-1499125562588-29fb8a56b5d5')], rating: 4.9, reviewCount: 156 },
  { name: 'Goat Mutton Curry Cut', slug: 'goat-mutton-curry-cut', description: 'Freshly cut goat mutton with bone, ideal for slow-cooked curries.', brand: 'FreshCut', price: 620, discountPrice: 560, stock: 35, minStock: 8, unit: '500 g', images: [img('photo-1544025162-d76694265947')], rating: 4.6, reviewCount: 234 },
  { name: 'Prawns (Medium)', slug: 'prawns-medium', description: 'Deveined medium prawns, clean and ready to cook.', brand: 'FreshCut', price: 380, stock: 40, minStock: 8, unit: '500 g', images: [img('photo-1565680018434-b513d5e5fd47')], rating: 4.6, reviewCount: 122 },
  { name: 'Dishwash Liquid', slug: 'dishwash-liquid', description: 'Cuts through grease with a lemon-fresh fragrance. Effective on tough stains.', brand: 'Vim', price: 98, stock: 180, minStock: 20, unit: '750 ml', images: [img('photo-1585421514738-01798e348b17')], rating: 4.5, reviewCount: 412 },
  { name: 'Laundry Detergent', slug: 'laundry-detergent', description: 'Removes tough stains and keeps clothes bright with long-lasting freshness.', brand: 'Surf Excel', price: 245, discountPrice: 215, stock: 160, minStock: 20, unit: '1 kg', images: [img('photo-1610557892470-55d9e80c0bce')], isBestSeller: true, rating: 4.6, reviewCount: 523 },
  { name: 'Floor Cleaner', slug: 'floor-cleaner', description: 'Kills 99.9% germs and leaves floors sparkling with a pine fragrance.', brand: 'Harpic', price: 145, stock: 140, minStock: 15, unit: '1 L', images: [img('photo-1584568694244-14fbdf83bd30')], rating: 4.4, reviewCount: 198 },
  { name: 'Toilet Paper (6 rolls)', slug: 'toilet-paper-6-rolls', description: 'Soft, strong and absorbent 3-ply toilet rolls.', brand: 'Scotch', price: 210, discountPrice: 189, stock: 150, minStock: 15, unit: '6 rolls', images: [img('photo-1601978424137-d1ddfb85ea60')], rating: 4.5, reviewCount: 256 },
  { name: 'Aloe Vera Body Wash', slug: 'aloe-vera-body-wash', description: 'Gentle hydrating body wash with aloe vera for soft, smooth skin.', brand: 'Dove', price: 260, discountPrice: 229, stock: 120, minStock: 15, unit: '250 ml', images: [img('photo-1556228720-195a672e8a03')], rating: 4.7, reviewCount: 389 },
  { name: 'Herbal Shampoo', slug: 'herbal-shampoo', description: 'Sulphate-free shampoo with amla and reetha for strong, healthy hair.', brand: 'Mamaearth', price: 320, stock: 110, minStock: 15, unit: '400 ml', images: [img('photo-1556228578-0d85b1a4d571')], rating: 4.6, reviewCount: 412 },
  { name: 'Toothpaste', slug: 'toothpaste', description: 'Complete fluoride protection toothpaste for cavity defense.', brand: 'Colgate', price: 95, discountPrice: 85, stock: 260, minStock: 30, unit: '150 g', images: [img('photo-1559591937-9d107a2b9584')], isBestSeller: true, rating: 4.5, reviewCount: 634 },
  { name: 'Vitamin C Face Serum', slug: 'vitamin-c-face-serum', description: 'Brightening serum with 10% vitamin C for glowing, even-toned skin.', brand: 'Minimalist', price: 549, discountPrice: 499, stock: 70, minStock: 10, unit: '30 ml', images: [img('photo-1620916566398-39f1143ab7be')], isFeatured: true, rating: 4.8, reviewCount: 287 },
]

async function seed(): Promise<void> {
  await connectDB()

  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    Coupon.deleteMany({}),
  ])

  const createdCategories = await Category.insertMany(categories)
  const catBySlug = new Map(createdCategories.map((c) => [c.slug, c._id]))

  const products = productData.map((p) => ({
    ...p,
    category: catBySlug.get(
      p.slug.startsWith('organic') || p.slug.includes('apple') || p.slug.includes('pear') || p.slug.includes('grape') || p.slug.includes('mango') || p.slug.includes('banana') || p.slug.includes('straw')
        ? 'fruits'
        : p.slug.includes('spinach') || p.slug.includes('tomato') || p.slug.includes('potato') || p.slug.includes('onion') || p.slug.includes('capsicum') || p.slug.includes('broccoli')
          ? 'vegetables'
          : p.slug.includes('milk') || p.slug.includes('paneer') || p.slug.includes('yogurt') || p.slug.includes('cheese') || p.slug.includes('egg')
            ? 'dairy-eggs'
            : p.slug.includes('bread') || p.slug.includes('pav') || p.slug.includes('croissant') || p.slug.includes('cookie')
              ? 'bakery'
              : p.slug.includes('juice') || p.slug.includes('chai') || p.slug.includes('coconut') || p.slug.includes('coffee')
                ? 'beverages'
                : p.slug.includes('chips') || p.slug.includes('almond') || p.slug.includes('muesli') || p.slug.includes('makhana')
                  ? 'snacks'
                  : p.slug.includes('chicken') || p.slug.includes('salmon') || p.slug.includes('mutton') || p.slug.includes('prawn')
                    ? 'meat-seafood'
                    : p.slug.includes('dishwash') || p.slug.includes('detergent') || p.slug.includes('floor') || p.slug.includes('toilet')
                      ? 'household'
                      : 'personal-care',
    ),
  }))

  await Product.insertMany(products)

  const coupons = [
    { code: 'FRESH10', description: '10% off on orders above ₹499', type: 'PERCENTAGE', value: 10, minOrderValue: 499, maxDiscount: 150, isActive: true },
    { code: 'WELCOME50', description: '₹50 off your first order above ₹299', type: 'FIXED', value: 50, minOrderValue: 299, isActive: true },
    { code: 'VEGGIE100', description: 'Flat ₹100 off on orders above ₹999', type: 'FIXED', value: 100, minOrderValue: 999, isActive: true },
    { code: 'FARM15', description: '15% off on orders above ₹799', type: 'PERCENTAGE', value: 15, minOrderValue: 799, maxDiscount: 250, isActive: true },
  ]
  await Coupon.insertMany(coupons)

  const count = await Product.countDocuments()
  logger.info(`Seeded ${categories.length} categories, ${count} products, ${coupons.length} coupons`)
  await disconnectDB()
  process.exit(0)
}

seed().catch(async (err) => {
  logger.error({ err }, 'Seed failed')
  await disconnectDB()
  process.exit(1)
})