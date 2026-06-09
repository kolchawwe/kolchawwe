/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'beer-1',
    name: 'Kolchawwe British Golden Ale',
    tagline: 'Nuestra insignia de selección: de color dorado, aromática y fresca',
    description: 'Nuestra cerveza de referencia directa de las botellas Kolchawwe. De color dorado brillante con una densa y persistente corona de espuma. Se caracteriza por sus lúpulos nobles ingleses que marcan notas florales y de malta de cebada, balanceando a la perfección su amargor con una bebabilidad increíble.',
    category: 'Lager',
    price: 3100,
    stock: 120,
    image: '/src/assets/images/kolchawwe_golden_ale_1781035680844.png',
    abv: 5.2,
    ibu: 20,
    volume: '330cc'
  },
  {
    id: 'beer-2',
    name: 'Kolchawwe Oatmeal Stout',
    tagline: 'Cremosa, robusta y con imponentes notas de café y cacao',
    description: 'Receta tradicional negra de Colchagua elaborada con avena tostada y maltas seleccionadas. Presenta un cuerpo sumamente aterciopelado con notas intensas de granos de café espresso, chocolate amargo artesanal y un sutil amargor herbal en boca que deleita la experiencia.',
    category: 'Stout',
    price: 3400,
    stock: 85,
    image: '/src/assets/images/kolchawwe_stout_1781035692102.png',
    abv: 6.8,
    ibu: 30,
    volume: '330cc'
  },
  {
    id: 'beer-3',
    name: 'Kolchawwe Hops Valley IPA',
    tagline: 'Explosión de lúpulos seleccionados con recuerdos cítricos tropicales',
    description: 'Una India Pale Ale de carácter audaz y fiero como el caballo rampante de nuestro sello. Ofrece un asombroso bouquet aromático frutal con notas de maracuyá, cáscara de naranja y resina de pino, balanceado por un amargor elegante y limpio en garganta.',
    category: 'IPA',
    price: 3300,
    stock: 95,
    image: '/src/assets/images/kolchawwe_mug_1781035668859.png',
    abv: 6.4,
    ibu: 48,
    volume: '330cc'
  },
  {
    id: 'beer-4',
    name: 'Kolchawwe Amber de Colchagua',
    tagline: 'El balance perfecto entre caramelos de malta cristal y lúpulo de montaña',
    description: 'De color cobrizo intenso con hermosos reflejos rubí. Combina ricas capas de malta dulce acaramelada del tipo toffee con el toque fresco de lúpulos cultivados, rindiendo un sabroso homenaje a las tardes cálidas del valle de Colchagua.',
    category: 'Amber',
    price: 3000,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=600',
    abv: 5.4,
    ibu: 22,
    volume: '330cc'
  },
  {
    id: 'beer-5',
    name: 'Kolchawwe Quad de Abadía & Miel',
    tagline: 'Compleja, licorosa, robustecida con miel nativa de San Fernando',
    description: 'Cerveza belga de abadía de alta graduación alcohólica. Fermentada con cepas de levadura trapense y enriquecida con la más fina miel de flores del valle de San Fernando. Despierta matices profundos de frutos secos maduros, pasas, ciruelas y un final licoroso dulce.',
    category: 'Belgian',
    price: 4200,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?auto=format&fit=crop&q=80&w=600',
    abv: 9.0,
    ibu: 26,
    volume: '330cc'
  }
];
