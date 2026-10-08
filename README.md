# Cinco capítulos · Seminario de ingeniería informática

Landing educativa en español, inspirada en la tipografía y el recorrido de https://www.syahrilarfianalmazril.my.id/. Contiene exactamente cinco capítulos y un caso profesional ilustrativo; no presenta la biografía ni los hábitos de Santiago. LinkedIn es el único enlace personal.

## Editar y abrir

El contenido está en build-content.py. Ejecutar Python build-content.py para regenerar dist/index.html. El diseño está en dist/styles.css y las interacciones en dist/app.js. Servir con python -m http.server 4173 --directory dist y abrir http://localhost:4173. El producto publicado es HTML estático; no necesita Python para funcionar.

## Recorrido

1. Perfil completo: técnica, conocimientos, experiencia formativa, comunicación, valores y cuatro dimensiones del autodiagnóstico.
2. Ocho fuentes específicas y enlazadas: Andrew Ng, The Batch, StatQuest, GitHub, WEF, OWASP, BBC y freeCodeCamp.
3. Cinco tendencias relacionadas con tecnología, trabajo, comunicación y vida personal. Las aplicaciones al perfil son interpretaciones del caso.
4. Cinco oportunidades: acción, plazo propuesto, evidencia y siguiente posibilidad por tendencia.
5. Perfil aspiracional en 2031 y ruta coherente 2027–2031. No promete resultados ni empleos.

## Movimiento

Scroll nativo con GSAP 3.15.0 y ScrollTrigger locales. Portada fijada con desplazamiento tipográfico; palabras reveladas durante la lectura; cinco escenas de tendencias; oportunidades en recorrido horizontal; años 2026–2031 animados. En pantallas pequeñas o bajas se ofrece lectura vertical con transiciones de scroll. Movimiento desactivable, preferencia de sistema respetada, contenido completo sin JavaScript y navegación por teclado. Las escenas fuera de pantalla no reciben foco.

Fuentes Inter alojadas localmente bajo SIL Open Font License, en dist/fonts/LICENSE.txt. GSAP conserva las cabeceras de licencia de la distribución oficial; condiciones en https://gsap.com/standard-license/. SVG originales, sin imágenes ni código extraídos de la referencia. Sin analítica, backend ni servicios de IA conectados.
