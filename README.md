# Futbolle ⚽

Un juego de deducción deportiva interactivo basado en la web, desarrollado completamente en **Vanilla JavaScript**, HTML5 y CSS3.

El proyecto demuestra fundamentos sólidos en arquitectura de frontend, manipulación pura del DOM, consumo asíncrono de APIs y persistencia de datos en el cliente, cumpliendo con estrictos estándares de accesibilidad y diseño Mobile-First.

## 🚀 Características Principales

- **Consumo de API RESTful:** Integración asíncrona (`fetch`) con un endpoint externo para obtener la entidad del jugador secreto y manejar consultas de autocompletado en tiempo real mediante _Debouncing_.
- **Arquitectura de Estado Local:** Motor de juego construido en ES5 estricto, separando responsabilidades entre la lógica de negocio, la validación de intentos y el renderizado visual.
- **Persistencia de Datos (Caché de Sesión):** Implementación de `LocalStorage` para mantener el historial de partidas, puntajes y preferencias de usuario (Modo Claro/Oscuro) entre sesiones.
- **Validación Estricta de Entradas:** Formularios de contacto blindados con Expresiones Regulares (Regex) en JavaScript puro, desactivando deliberadamente las validaciones nativas de HTML5 (`novalidate`) para garantizar el control algorítmico del lado del cliente.
- **UI/UX y Accesibilidad:** Diseño 100% responsivo construido exclusivamente con Flexbox (sin floats ni grids). Incluye soporte nativo para Modo Oscuro/Claro mediante variables CSS (`:root`) y manejo semántico de modales (`<dialog>`).

## 🛠️ Stack Tecnológico

- **Lógica:** Vanilla JavaScript (ES5 estricto). Sin dependencias de terceros ni frameworks.
- **Estructura:** HTML5 Semántico.
- **Estilos:** CSS3 Puro (Flexbox, Mobile-First, Variables Nativas, Pseudo-clases).

## ⚙️ Estructura del Proyecto

El código está estructurado bajo principios de _Single Source of Truth_ (SSOT) para los estilos y separación de responsabilidades en la lógica:

- `index.html` / `contacto.html`: Vistas principales.
- `style.css`: Hoja de estilos global centralizada y variables de entorno UI.
- `script.js`: Motor principal del juego, llamadas asíncronas y manipulación del DOM.
- `contacto.js`: Módulo de validación estricta y delegación de protocolos de sistema (`mailto:`).

## 💻 Instalación y Ejecución

Al ser un proyecto estrictamente _Client-Side_ sin dependencias de Node.js, no requiere un proceso de compilación.

1. Clonar el repositorio:
   ```bash
   git clone [https://github.com/LucianoMarello/futbolle.git](https://github.com/LucianoMarello/futbolle.git)
   ```
2. Abrir el directorio del proyecto.
3. Ejecutar `index.html` en cualquier navegador moderno o utilizar una extensión como _Live Server_ en VSCode para evitar bloqueos de CORS locales durante las llamadas a la API.

## 🌐 Despliegue en Producción

El proyecto se encuentra desplegado y accesible públicamente a través de GitHub Pages:
🔗 **[Jugar a Futbolle Aquí](https://lucianomarello.github.io/futbolle/)**

---

_Desarrollado por Luciano Marello._
