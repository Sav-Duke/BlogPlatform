import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  await prisma.comment.deleteMany({})
  await prisma.post.deleteMany({})
  await prisma.category.deleteMany({})
  await prisma.tag.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.settings.deleteMany({})

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@animalhub.com',
      name: 'Dr. Sarah Johnson',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
      bio: 'Veterinarian and animal health specialist with 15+ years of experience. Passionate about animal welfare and education.',
      image: 'https://i.pravatar.cc/150?img=1',
    },
  })

  const author1 = await prisma.user.create({
    data: {
      email: 'john@animalhub.com',
      name: 'John Miller',
      password: await bcrypt.hash('author123', 10),
      role: 'AUTHOR',
      bio: 'Livestock production specialist and agricultural consultant. Expert in sustainable farming practices.',
      twitter: '@john_livestock',
      image: 'https://i.pravatar.cc/150?img=12',
    },
  })

  const author2 = await prisma.user.create({
    data: {
      email: 'emily@animalhub.com',
      name: 'Emily Roberts',
      password: await bcrypt.hash('author123', 10),
      role: 'AUTHOR',
      bio: 'Pet care expert and certified animal behaviorist. Helping pet owners understand their furry friends better.',
      website: 'https://emily-pets.com',
      twitter: '@emily_pets',
      image: 'https://i.pravatar.cc/150?img=5',
    },
  })

  console.log('✅ Created users')

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Animal Health',
        slug: 'animal-health',
        description: 'Veterinary care, disease prevention, and health management for all animals',
        color: '#22c55e',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Livestock Production',
        slug: 'livestock-production',
        description: 'Cattle, poultry, swine, and other livestock management and production techniques',
        color: '#f97316',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pet Care',
        slug: 'pet-care',
        description: 'Care tips, training, and health advice for dogs, cats, and other pets',
        color: '#ec4899',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Animal Nutrition',
        slug: 'animal-nutrition',
        description: 'Feeding strategies, dietary requirements, and nutrition science',
        color: '#8b5cf6',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Wildlife & Conservation',
        slug: 'wildlife-conservation',
        description: 'Wildlife management, conservation efforts, and ecosystem protection',
        color: '#10b981',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Animal Behavior',
        slug: 'animal-behavior',
        description: 'Understanding animal psychology, training, and behavioral science',
        color: '#3b82f6',
      },
    }),
  ])

  console.log('✅ Created categories')

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Veterinary', slug: 'veterinary' } }),
    prisma.tag.create({ data: { name: 'Cattle', slug: 'cattle' } }),
    prisma.tag.create({ data: { name: 'Poultry', slug: 'poultry' } }),
    prisma.tag.create({ data: { name: 'Dogs', slug: 'dogs' } }),
    prisma.tag.create({ data: { name: 'Cats', slug: 'cats' } }),
    prisma.tag.create({ data: { name: 'Disease Prevention', slug: 'disease-prevention' } }),
    prisma.tag.create({ data: { name: 'Nutrition', slug: 'nutrition' } }),
    prisma.tag.create({ data: { name: 'Training', slug: 'training' } }),
    prisma.tag.create({ data: { name: 'Breeding', slug: 'breeding' } }),
    prisma.tag.create({ data: { name: 'Sustainable Farming', slug: 'sustainable-farming' } }),
    prisma.tag.create({ data: { name: 'Emergency Care', slug: 'emergency-care' } }),
    prisma.tag.create({ data: { name: 'Wellness', slug: 'wellness' } }),
  ])

  console.log('✅ Created tags')

  // Create posts
  await prisma.post.create({
    data: {
      title: '10 Essential Vaccination Guidelines for Livestock Animals',
      slug: 'livestock-vaccination-guidelines',
      excerpt: 'A comprehensive guide to protecting your herd with proper vaccination schedules and best practices for cattle, sheep, and goats.',
      content: `
# Essential Vaccination Guidelines for Livestock

Proper vaccination is the cornerstone of livestock health management. Here's what every farmer needs to know.

## Why Vaccination Matters

Vaccines protect your animals from infectious diseases that can devastate entire herds and impact your bottom line.

### Core Vaccines for Cattle:
- Clostridial diseases (7-way or 8-way)
- IBR/BVD (respiratory diseases)
- Leptospirosis
- Brucellosis (where required)

## Timing and Administration

**Calves:** Begin vaccination at 2-4 months of age
**Adult cattle:** Annual boosters are essential
**Pregnant cows:** Vaccinate 30-60 days before calving

## Best Practices

1. Store vaccines at proper temperature (35-45°F)
2. Use clean needles and equipment
3. Keep detailed records
4. Consult with your veterinarian regularly

## Common Mistakes to Avoid

- Vaccinating sick animals
- Improper storage
- Skipping booster shots
- Using expired vaccines

**Remember:** Prevention is always cheaper than treatment. A well-planned vaccination program protects your investment and ensures animal welfare.
`,
      coverImage: 'https://picsum.photos/seed/livestock1/1200/600',
      status: 'PUBLISHED',
      featured: true,
      viewCount: 2847,
      readTime: 8,
      authorId: author1.id,
      publishedAt: new Date('2025-12-01'),
      seoTitle: 'Livestock Vaccination Guide - 10 Essential Tips',
      seoDescription: 'Complete vaccination guidelines for cattle, sheep, and goats. Learn timing, best practices, and common mistakes to avoid.',
      seoKeywords: 'livestock vaccination, cattle vaccines, animal health, disease prevention',
      categories: {
        connect: [
          { id: categories[0].id }, // Animal Health
          { id: categories[1].id }, // Livestock Production
        ],
      },
      tags: {
        connect: [
          { id: tags[0].id }, // Veterinary
          { id: tags[1].id }, // Cattle
          { id: tags[5].id }, // Disease Prevention
        ],
      },
    },
  })

  await prisma.post.create({
    data: {
      title: 'Complete Guide to Dog Nutrition: What Every Pet Owner Should Know',
      slug: 'dog-nutrition-complete-guide',
      excerpt: 'Learn about optimal nutrition for your canine companion, from puppyhood to senior years, including dietary requirements and food recommendations.',
      content: `
# The Complete Guide to Dog Nutrition

Proper nutrition is fundamental to your dog's health and longevity. Here's everything you need to know.

## Understanding Nutritional Needs

Dogs require a balanced diet containing:
- **Proteins:** 18-25% for adults, 22-32% for puppies
- **Fats:** 10-15% minimum
- **Carbohydrates:** 30-70%
- **Vitamins and minerals**

## Life Stage Nutrition

### Puppies (0-12 months)
- High-calorie, protein-rich diet
- Feed 3-4 times daily
- DHA for brain development

### Adults (1-7 years)
- Maintenance diet
- Feed twice daily
- Monitor weight regularly

### Seniors (7+ years)
- Lower calorie content
- Joint support supplements
- Easier-to-digest proteins

## Reading Dog Food Labels

Look for:
- Named protein source (chicken, beef) as first ingredient
- AAFCO certification
- No artificial preservatives or colors
- Appropriate life stage designation

## Common Nutritional Mistakes

1. Overfeeding
2. Too many treats (should be <10% of daily calories)
3. Sharing human food
4. Inconsistent feeding schedule

## Special Dietary Considerations

- **Allergies:** Common allergens include beef, dairy, wheat
- **Sensitive stomachs:** Limited ingredient diets
- **Weight management:** Reduce calories, increase exercise

**Consult your veterinarian** before making major dietary changes!
`,
      coverImage: 'https://picsum.photos/seed/dogs1/1200/600',
      status: 'PUBLISHED',
      featured: true,
      viewCount: 3521,
      readTime: 10,
      authorId: author2.id,
      publishedAt: new Date('2025-12-05'),
      seoTitle: 'Dog Nutrition Guide - Complete Feeding Guidelines',
      seoDescription: 'Everything pet owners need to know about dog nutrition, from puppies to seniors. Includes feeding guidelines and food recommendations.',
      seoKeywords: 'dog nutrition, pet care, dog feeding, canine diet',
      categories: {
        connect: [
          { id: categories[2].id }, // Pet Care
          { id: categories[3].id }, // Animal Nutrition
        ],
      },
      tags: {
        connect: [
          { id: tags[3].id }, // Dogs
          { id: tags[6].id }, // Nutrition
          { id: tags[11].id }, // Wellness
        ],
      },
    },
  })

  await prisma.post.create({
    data: {
      title: 'Maximizing Egg Production in Layer Hens: A Scientific Approach',
      slug: 'maximizing-egg-production-layer-hens',
      excerpt: 'Evidence-based strategies to optimize egg production in commercial and backyard flocks while maintaining bird health and welfare.',
      content: `
# Maximizing Egg Production in Layer Hens

Efficient egg production requires understanding the science behind laying cycles and optimal management practices.

## Factors Affecting Egg Production

### 1. Lighting
- 14-16 hours of light daily for optimal production
- Consistent schedule is crucial
- Gradual light changes only

### 2. Nutrition
- 16-18% protein for layers
- Adequate calcium (3.5-4.5%)
- Fresh, clean water always available

### 3. Temperature
- Ideal range: 65-75°F (18-24°C)
- Heat stress reduces production
- Proper ventilation essential

## Housing Management

**Space Requirements:**
- Cage-free: 1.5 sq ft per bird
- Free-range: 2+ sq ft indoor, 10+ sq ft outdoor

**Nest Boxes:**
- 1 box per 4-5 hens
- Clean, dry bedding
- Dimly lit, private location

## Production Timeline

- **Week 18-20:** First eggs (pullet eggs)
- **Week 25-30:** Peak production (90-95%)
- **Week 70+:** Production decline begins

## Health Management

Regular monitoring for:
- Internal/external parasites
- Respiratory issues
- Pecking order problems
- Nutritional deficiencies

## Sustainable Practices

- Rotational grazing for free-range flocks
- Composting waste properly
- Natural pest control methods
- Heritage breed consideration

**Pro Tip:** Keep detailed production records to identify trends and issues early!
`,
      coverImage: 'https://picsum.photos/seed/poultry1/1200/600',
      status: 'PUBLISHED',
      featured: true,
      viewCount: 1923,
      readTime: 9,
      authorId: author1.id,
      publishedAt: new Date('2025-12-08'),
      seoTitle: 'Maximize Layer Hen Egg Production - Complete Guide',
      seoDescription: 'Scientific strategies to optimize egg production in commercial and backyard layer flocks while maintaining health.',
      seoKeywords: 'egg production, layer hens, poultry management, sustainable farming',
      categories: {
        connect: [
          { id: categories[1].id }, // Livestock Production
          { id: categories[3].id }, // Animal Nutrition
        ],
      },
      tags: {
        connect: [
          { id: tags[2].id }, // Poultry
          { id: tags[6].id }, // Nutrition
          { id: tags[9].id }, // Sustainable Farming
        ],
      },
    },
  })

  await prisma.post.create({
    data: {
      title: 'Understanding Cat Behavior: Why Your Cat Does What They Do',
      slug: 'understanding-cat-behavior',
      excerpt: 'Decode your feline friend\'s mysterious behaviors and learn what they\'re trying to communicate through body language and vocalizations.',
      content: `
# Understanding Cat Behavior

Cats are complex creatures with rich emotional lives. Here's how to decode their behavior.

## Common Behaviors Explained

### Kneading ("Making Biscuits")
- Sign of contentment and security
- Instinct from kittenhood (nursing behavior)
- Shows they trust you completely

### Slow Blinking
- The "cat kiss"
- Indicates trust and affection
- You can slow blink back!

### Head Butting (Bunting)
- Marking you with their scent
- Showing affection and claiming ownership
- Sign of bonding

## Body Language Guide

**Tail Positions:**
- **Straight up:** Happy, confident
- **Puffed up:** Scared or aggressive
- **Tucked:** Fearful, submissive
- **Twitching tip:** Focused or mildly annoyed

**Ear Positions:**
- **Forward:** Alert, interested
- **Sideways:** Nervous, uncertain
- **Flat back:** Frightened or angry

## Vocalizations

- **Meowing:** Primarily for human communication
- **Purring:** Usually contentment (sometimes pain/stress)
- **Chirping:** Excitement, hunting instinct
- **Hissing/Growling:** Warning, fear, aggression

## Problem Behaviors

### Scratching Furniture
**Solution:** Multiple scratching posts, nail trimming, positive reinforcement

### Litter Box Issues
**Causes:** Dirty box, medical issues, stress, location problems

### Excessive Meowing
**Reasons:** Attention-seeking, hunger, medical issues, aging

## Environmental Enrichment

- Vertical spaces (cat trees, shelves)
- Window perches for bird watching
- Interactive toys and puzzle feeders
- Regular play sessions (15-20 min daily)

## When to Seek Help

Consult a veterinarian or animal behaviorist if:
- Sudden behavior changes
- Aggression toward people/pets
- Excessive hiding or withdrawal
- Inappropriate elimination persists

**Remember:** Every cat is unique. Learning your cat's individual personality is key to a happy relationship!
`,
      coverImage: 'https://picsum.photos/seed/cats1/1200/600',
      status: 'PUBLISHED',
      featured: false,
      viewCount: 1654,
      readTime: 8,
      authorId: author2.id,
      publishedAt: new Date('2025-12-10'),
      seoTitle: 'Cat Behavior Guide - Understanding Your Feline Friend',
      seoDescription: 'Complete guide to understanding cat behavior, body language, and vocalizations. Learn what your cat is trying to tell you.',
      seoKeywords: 'cat behavior, feline psychology, cat body language, pet care',
      categories: {
        connect: [
          { id: categories[2].id }, // Pet Care
          { id: categories[5].id }, // Animal Behavior
        ],
      },
      tags: {
        connect: [
          { id: tags[4].id }, // Cats
          { id: tags[7].id }, // Training
          { id: tags[11].id }, // Wellness
        ],
      },
    },
  })

  await prisma.post.create({
    data: {
      title: 'Emergency First Aid for Farm Animals: What Every Farmer Needs to Know',
      slug: 'emergency-first-aid-farm-animals',
      excerpt: 'Essential first aid techniques and emergency response protocols for common livestock emergencies. Be prepared to act when seconds count.',
      content: `
# Emergency First Aid for Farm Animals

Quick action during emergencies can save lives. Here's what you need to know.

## Essential First Aid Kit

Your farm should have:
- **Wound care:** Gauze, bandages, tape, antiseptic
- **Medications:** Antibiotics, pain relief, anti-inflammatories
- **Tools:** Thermometer, scissors, tweezers, flashlight
- **Emergency supplies:** Electrolytes, syringes, needles

## Common Emergencies

### Bloat (Cattle)
**Signs:** Distended left side, difficulty breathing, restlessness
**Action:** 
1. Walk the animal (if possible)
2. Pass stomach tube if trained
3. Call veterinarian immediately

### Prolapse (Livestock)
**Signs:** Tissue protruding from vagina or rectum
**Action:**
1. Keep tissue moist and clean
2. Prevent further straining
3. Immediate veterinary attention required

### Milk Fever (Dairy Cows)
**Signs:** Weakness, cold ears, inability to stand
**Action:**
1. Administer calcium solution IV (if trained)
2. Keep animal warm
3. Veterinary care essential

### Severe Bleeding
**Action:**
1. Apply direct pressure
2. Elevate if possible
3. Apply pressure bandage
4. Monitor for shock

## Shock Recognition

**Signs:**
- Rapid, weak pulse
- Pale mucous membranes
- Cool extremities
- Rapid breathing

**Treatment:**
- Keep warm
- Minimize stress
- Elevate hindquarters slightly
- Immediate veterinary care

## Poisoning Response

1. Identify the toxin if possible
2. Remove access to poison
3. Do NOT induce vomiting
4. Contact poison control or veterinarian
5. Bring sample of suspected toxin

## Prevention is Key

- Regular health checks
- Proper fencing and facilities
- Remove hazardous materials
- Train all farm workers
- Have emergency contacts posted
- Maintain good relationships with veterinarians

## Emergency Contacts Checklist

Keep readily accessible:
- Primary veterinarian: [ ]
- Emergency vet clinic: [ ]
- Poison control: [ ]
- Livestock specialist: [ ]
- Nearest animal hospital: [ ]

**Remember:** First aid is not a substitute for veterinary care. Always follow up with professional medical attention!
`,
      coverImage: 'https://picsum.photos/seed/emergency1/1200/600',
      status: 'PUBLISHED',
      featured: false,
      viewCount: 1287,
      readTime: 11,
      authorId: admin.id,
      publishedAt: new Date('2025-12-12'),
      seoTitle: 'Farm Animal First Aid - Emergency Response Guide',
      seoDescription: 'Essential first aid techniques for livestock emergencies. Learn how to respond quickly and effectively to save animal lives.',
      seoKeywords: 'animal first aid, livestock emergency, farm animal care, veterinary emergency',
      categories: {
        connect: [
          { id: categories[0].id }, // Animal Health
          { id: categories[1].id }, // Livestock Production
        ],
      },
      tags: {
        connect: [
          { id: tags[0].id }, // Veterinary
          { id: tags[10].id }, // Emergency Care
          { id: tags[1].id }, // Cattle
        ],
      },
    },
  })

  console.log('✅ Created posts')

  // Create settings
  await prisma.settings.create({
    data: {
      id: 'default',
      siteName: 'Animal Hub',
      siteDescription: 'Your comprehensive resource for animal health, livestock production, pet care, and veterinary insights. Expert advice for farmers, pet owners, and animal enthusiasts.',
      siteUrl: 'http://localhost:3000',
      allowComments: true,
      moderateComments: true,
      postsPerPage: 12,
      socialTwitter: '@animalhub',
      socialFacebook: 'animalhub',
      socialInstagram: '@animal_hub',
    },
  })

  console.log('✅ Created settings')
  console.log('✨ Database seeding completed!')
  console.log('\n📝 Login credentials:')
  console.log('Admin: admin@animalhub.com / admin123')
  console.log('Author 1: john@animalhub.com / author123')
  console.log('Author 2: emily@animalhub.com / author123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
