# Diseño implementado

La referencia del usuario gobierna esta versión. Inter 900 muy grande, composición asimétrica, fondo negro carbón (#111111), blanco apagado (#efefeb), azul (#b4d9ef) y amarillo (#f0d96e). Georgia cursiva cambia la voz de los remates. El capítulo de oportunidades ocupa una superficie amarilla completa.

Jerarquía: pregunta tipográfica en el primer capítulo; títulos desplazados entre líneas; narrativa en dos columnas; competencias separadas por reglas; fuentes en acordeones; tendencias como escenas; oportunidades como paneles horizontales; proyección con odómetro de años y ruta editorial. Los números identifican los cinco pasos obligatorios y sus correspondencias.

Escala: texto 13–27px; enlaces y controles al menos 11px. Display se adapta a anchura y altura del viewport. Separación de capítulos 65–130px. Padding lateral 22px en móvil y 5vw en escritorio. SVG originales, sin raster.

ScrollTrigger fija escenas a partir de 960×680. La portada se desplaza en direcciones opuestas, palabras se iluminan durante la lectura, las tendencias se superponen verticalmente, oportunidades avanzan en horizontal y 2026 gira hasta 2031. Scroll nativo sin sustituir rueda o gestos. Botones de escena saltan al contenido y transfieren foco; escenas ocultas usan inert y aria-hidden sincronizados con la animación renderizada.

En móvil y pantallas bajas todo el contenido se apila. Desactivar movimiento elimina los pins y mantiene la lectura. Prefers-reduced-motion tiene prioridad. Sin JS, textos, fuentes, tendencias, oportunidades y autodiagnóstico permanecen legibles. Foco azul en oscuro y negro en amarillo; selección amarilla.

## Revisión final

Se revisó estructura y procedencia, y un segundo agente auditó movimiento y accesibilidad. Inspección visual en 1280×720 y 390×844. Correcciones: recorte de paneles adyacentes, títulos limitados por altura, etiquetas de navegación accesibles en móvil, controles táctiles de 44px, sincronización de foco y actualización de dimensiones tras cargar fuentes sin deshacer navegación. El detector se ejecutó: Inter y cursiva son decisiones explícitas de la referencia; numerales de fondo son decoración aria-hidden. Las etiquetas funcionales pequeñas se ampliaron.

Veredicto: cinco capítulos completos, sin contenido de portafolio personal. Proyección ilustrativa con ocho fuentes enlazadas y una oportunidad medible por tendencia.
