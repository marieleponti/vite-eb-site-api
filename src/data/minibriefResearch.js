// src/data/minibriefResearch.js
// Fuente única de verdad para los 4 research fijos.
// El listado usa excerpt/featuredImage.
// El single (MiniBriefSingle.vue) usa content/slug completos.
//
// El contenido largo vive en archivos .html separados bajo ./minibriefs/
// y se importa con el sufijo `?raw` de Vite, que lo trae como string
// plano (HTML semántico simple, sin clases de ningún framework/builder
// externo).

import borderExternalizationContent from './minibriefs/border-extern-brief.html?raw'
import biometricsBasedContent from './minibriefs/biometrics-migra-mgmt-brief.html?raw'
import humanImpactsContent from './minibriefs/human-impacts-brief.html?raw'
import biometricsMxCaContent from './minibriefs/biometrics-borders-brief.html?raw'

export const minibriefResearch = [
  {
    slug: 'border-externalization-in-americas',
    title: 'Border Externalization in the Americas',
    permalink: '/research/border-externalization-in-americas',
    featuredImage: null,
    heroEmbed: '<iframe src="https://cdn.knightlab.com/libs/timeline3/latest/embed/index.html?source=1nzqeOrx7kKc0715JnryKQECopm-8ywVC8RqmSJQFBME&font=Default&lang=en&initial_zoom=2&height=650" width="100%" height="650" loading="lazy" allowfullscreen style="border:0;display:block;"></iframe>',
    excerpt: 'Analysis of digital border infrastructure expansion.',
    content: borderExternalizationContent,
    author: 'Mizue Aizeki and Santiago Narváez',
    date: '2025-02-24',
    restricted: false
  },
  {
    slug: 'biometrics-based-migration-management',
    title: 'Biometrics-Based Migration Management Infrastructures',
    permalink: '/research/biometrics-based-migration-management',
    featuredImage: 'https://www.everywhereborder.org/wp-content/uploads/2025/02/table.jpg',
    excerpt: 'Surveillance and digital control tracking throughout Latin America.',
    content: biometricsBasedContent,
    author: 'Santiago Narváez',
    date: '2025-02-20',
    restricted: true
  },
  {
    slug: 'human-impacts-brief',
    title: 'Human Impacts',
    permalink: '/research/human-impacts-brief',
    featuredImage: 'https://www.everywhereborder.org/wp-content/uploads/2025/02/colombia-1.jpg',
    excerpt: 'The cost of state deterrence policies on migrant populations.',
    content: humanImpactsContent,
    author: 'Laura Bingham',
    date: '2024-06-20',
    restricted: false
  },
  {
    slug: 'biometrics-mx-ca',
    title: 'Biometrics & Borders',
    permalink: '/research/biometrics-mx-ca',
    featuredImage: 'https://www.everywhereborder.org/wp-content/uploads/2025/10/infographic-us-biometric-border.jpg',
    excerpt: 'How Washington funded a corporate data collection empire in Mexico & Central America.',
    content: biometricsMxCaContent,
    author: 'The Everywhere Border Project',
    date: '2025-10-01',
    restricted: false
  }
]