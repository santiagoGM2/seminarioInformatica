# seminarioInformatica

Web personal de Santiago Gómez para el Seminario de Ingeniería Informática. Cinco capítulos: quién soy, fuentes de información, tendencias, oportunidades y perfil aspiracional en 2031.

## Abrir y editar

El producto es estático. Servir la carpeta dist con cualquier servidor HTTP; por ejemplo:

    python -m http.server 4173 --directory dist

Abrir http://localhost:4173. No necesita Node, Python ni un backend en el alojamiento final. Python solo se usa para regenerar el contenido:

    python build-content.py
    python verify-site.py
    node --check dist/app.js

- build-content.py: contenido y estructura semántica, incluyendo referentes y cinco relaciones tendencia/oportunidad.
- dist/styles.css: tipografía, paleta grafito/plata/morado y composición adaptable.
- dist/app.js: GSAP, navegación, filtros, autodiagnóstico y control de movimiento.
- dist/assets: fotografía de Santiago, avatares públicos de referentes y SVG originales.
- ASSETS.json: procedencia de imágenes y recursos visuales.

## Contenido

Perfil basado en los CV facilitados por Santiago y en sus conocimientos declarados de machine learning, deep learning y minería de datos. Se conserva «estudiante de último semestre», sin afirmar título ni especialización ya obtenidos. Grovia se describe como experiencia de noviembre de 2025 a junio de 2026, no como empleo actual. El nivel de inglés de partida es intermedio. No se publican copias de los CV, correo ni teléfono.

Los seis referentes son Midudev, Andrew Ng, DotCSV, MoureDev, Fazt y StatQuest. Kaggle y OWASP complementan los recursos. El mapa se amplía a petición de Santiago; no se inventan cursos completados ni frecuencias de consumo. Tendencias y autodiagnóstico son una reflexión profesional propuesta, y 2031 es un perfil aspiracional condicionado al trabajo descrito.

## Movimiento y adaptación

GSAP 3.15.0 y ScrollTrigger alojados localmente. La foto viaja del centro hacia la izquierda, un cubo CSS 3D rota y cambia de lado a través de tres dimensiones del perfil, y el año pasa de 2026 a 2031 con una pausa final. Los pins no tienen condición de altura ni dependen de F11. La composición cambia por anchura; altura y distancias se recalculan al redimensionar, cargar fuentes o imágenes.

El texto largo permanece en flujo normal. Hay navegación por teclado, foco visible, controles táctiles, filtro de referentes, un autodiagnóstico con pestañas y modo sin animaciones. Se respeta prefers-reduced-motion y el contenido sigue legible sin JavaScript.

Diseño inspirado en https://www.syahrilarfianalmazril.my.id/, con implementación original y la paleta del banner aportado por Santiago. El banner no se usa como fondo ni se copian imágenes o código de esa web.

Inter se aloja bajo SIL Open Font License (dist/fonts/LICENSE.txt). GSAP conserva las cabeceras de la distribución oficial: https://gsap.com/standard-license/. Los retratos de creadores se vinculan a sus perfiles oficiales para identificación editorial. Los diagramas son SVG originales. Sin analítica, formularios, backend ni servicios de IA conectados.
