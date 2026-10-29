export const products = [
  {
    id: 'crew-sweatshirt',
    name: 'Crew sweatshirt',
    department: 'men',
    price: 78,
    fabric: 'Cotton fleece',
    description:
      'A black crew in midweight fleece, worn over a white tee. Ribbed neck, cuffs, and hem.',
    sizes: ['S', 'M', 'L', 'XL'],
    image: '/products/merino-crew.jpg',
  },
  {
    id: 'chambray-shirt',
    name: 'Chambray shirt',
    department: 'men',
    price: 68,
    fabric: 'Chambray',
    description:
      'A blue chambray button-up with a small white print, a chest pocket, and a soft collar.',
    sizes: ['S', 'M', 'L', 'XL'],
    image: '/products/chambray-shirt.jpg',
  },
  {
    id: 'dress-shirt',
    name: 'Dress shirt',
    department: 'men',
    price: 72,
    fabric: 'Cotton poplin',
    description:
      'A pressed dress shirt with a point collar and button cuffs. Shown folded in navy, white, and burgundy.',
    sizes: ['S', 'M', 'L', 'XL'],
    image: '/products/oxford-shirt.jpg',
  },
  {
    id: 'cotton-chino',
    name: 'Cotton chino',
    department: 'men',
    price: 84,
    fabric: 'Cotton twill',
    description:
      'A slim khaki chino with a turned cuff. Sits at the waist and works with the tee or the chambray.',
    sizes: ['30', '32', '34', '36'],
    image: '/products/pleated-trouser.jpg',
  },
  {
    id: 'indigo-jean',
    name: 'Indigo jean',
    department: 'men',
    price: 98,
    fabric: 'Denim',
    description:
      'Straight indigo jeans with a five-pocket cut, shown on wooden hangers. Button fly, mid rise.',
    sizes: ['30', '32', '34', '36'],
    image: '/products/denim-jacket.jpg',
  },
  {
    id: 'heavyweight-tee',
    name: 'Heavyweight tee',
    department: 'men',
    price: 42,
    fabric: 'Cotton jersey',
    description:
      'A plain white crew in a heavier jersey. The neck is bound, and the hem sits at the hip.',
    sizes: ['S', 'M', 'L', 'XL'],
    image: '/products/heavyweight-tee.jpg',
  },
  {
    id: 'embroidered-shirt',
    name: 'Embroidered shirt',
    department: 'women',
    price: 86,
    fabric: 'Cotton eyelet',
    description:
      'A white short-sleeve shirt with floral eyelet across the yoke. It ties at the waist.',
    sizes: ['XS', 'S', 'M', 'L'],
    image: '/products/silk-blouse.jpg',
  },
  {
    id: 'denim-dress',
    name: 'Denim shirt dress',
    department: 'women',
    price: 118,
    fabric: 'Denim',
    description:
      'A short-sleeve shirt dress in light denim, with chest pockets, a button front, and a full skirt.',
    sizes: ['XS', 'S', 'M', 'L'],
    image: '/products/tailored-blazer.jpg',
  },
  {
    id: 'red-gown',
    name: 'Red gown',
    department: 'women',
    price: 188,
    fabric: 'Satin',
    description:
      'A sleeveless red gown with a fitted bodice and a full skirt that moves when you walk.',
    sizes: ['XS', 'S', 'M', 'L'],
    image: '/products/column-dress.jpg',
  },
  {
    id: 'pull-on-trouser',
    name: 'Pull-on trouser',
    department: 'women',
    price: 92,
    fabric: 'Soft twill',
    description:
      'A high-rise pull-on in dusty rose, with patch pockets and a narrow cuff at the ankle.',
    sizes: ['XS', 'S', 'M', 'L'],
    image: '/products/wide-leg-trouser.jpg',
  },
  {
    id: 'camel-coat',
    name: 'Camel wrap coat',
    department: 'women',
    price: 240,
    fabric: 'Wool',
    description:
      'A camel wrap coat with a wide lapel and a self belt. It closes across the front and falls below the knee.',
    sizes: ['XS', 'S', 'M', 'L'],
    image: '/products/wool-overcoat.jpg',
  },
  {
    id: 'ivory-coat',
    name: 'Ivory overcoat',
    department: 'women',
    price: 220,
    fabric: 'Wool blend',
    description:
      'An ivory double-breasted overcoat with peak lapels. Worn open, it covers a black knit underneath.',
    sizes: ['XS', 'S', 'M', 'L'],
    image: '/products/ivory-coat.jpg',
  },
]

export function formatPrice(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function departmentLabel(department) {
  if (department === 'men') return 'Men'
  if (department === 'women') return 'Women'
  return 'All'
}
