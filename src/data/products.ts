/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'beer-1',
    name: 'Valdivian Fog IPA',
    tagline: 'Explosión de lúpulo tropical y cítricos',
    description: 'Una American IPA cargada de lúpulos Citra y Mosaic. Posee un amargor balanceado de notas de mango, maracuyá y un toque resinoso ideal para maridar con hamburguesas y quesos fuertes.',
    category: 'IPA',
    price: 3200,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&q=80&w=600',
    abv: 6.5,
    ibu: 55,
    volume: '330cc'
  },
  {
    id: 'beer-2',
    name: 'Imperial Oatmeal Stout',
    tagline: 'Cremosa, intensa y con notas de cacao',
    description: 'Nuestra mítica Stout fermentada con abundante avena y maltas tostadas especiales. Presenta notas marcadas a café espresso, chocolate amargo y un retrogusto sedoso irresistible.',
    category: 'Stout',
    price: 3500,
    stock: 85,
    image: 'https://images.unsplash.com/photo-1584225065152-4a1454aa3d4e?auto=format&fit=crop&q=80&w=600',
    abv: 7.2,
    ibu: 35,
    volume: '330cc'
  },
  {
    id: 'beer-3',
    name: 'Altamar Golden Lager',
    tagline: 'Limpia, refrescante y altamente bebible',
    description: 'Una cerveza de baja fermentación al más puro estilo lagering alemán. De cuerpo ligero, notas florales del lúpulo Saaz y un final seco de malta pilsen que limpia el paladar.',
    category: 'Lager',
    price: 2800,
    stock: 200,
    image: 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&q=80&w=600',
    abv: 4.8,
    ibu: 18,
    volume: '330cc'
  },
  {
    id: 'beer-4',
    name: 'Crimson Amber Ale',
    tagline: 'Balance perfecto entre malta dulce y lúpulo',
    description: 'Inspirada en las cervezas rojas irlandesas, destaca por su intenso color rubí y notas acarameladas de malta cristal, complementadas con un suave amargor herbal.',
    category: 'Amber',
    price: 3000,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=600',
    abv: 5.4,
    ibu: 24,
    volume: '330cc'
  },
  {
    id: 'beer-5',
    name: 'Belgian Quadruple Honey',
    tagline: 'Compleja, licorosa y armada con miel local',
    description: 'Cerveza de estilo belga de abadía de alta graduación alcohólica. Fermentada con levadura trapense y miel orgánica de ulmo, revela sabores a frutos secos, pasas e higos.',
    category: 'Belgian',
    price: 4200,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?auto=format&fit=crop&q=80&w=600',
    abv: 9.0,
    ibu: 28,
    volume: '330cc'
  }
];
