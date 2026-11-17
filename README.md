# Monitor de Convocatorias Públicas de Bolivia (SICOES)

Aplicación web de escritorio (*Single-Page Application*) diseñada para consultar, filtrar y analizar en tiempo real las contrataciones y convocatorias públicas del Estado Plurinacional de Bolivia.

## Resumen del Proyecto

El panel ofrece una interfaz analítica oscura de alta densidad (optimizada para pantallas ≥ 1280 px) con:

- **Barra lateral de filtros multidimensionales:** acceso rápido a entidades clave (`ABC`, `BOA`, `YPFB`, `Ministerios`, `Sector Salud`), diferenciación por nivel de gobierno (`Nacional`, `Departamental` y `Municipal`), filtro por departamento, modalidad y estado.
- **Mapa interactivo de municipios de Bolivia:** capa vectorial GeoJSON integrada con Leaflet que permite hacer clic en cualquier municipio (como El Alto, La Paz, Cochabamba, Santa Cruz de la Sierra, etc.) para filtrar automáticamente los procesos de su Gobierno Autónomo Municipal.
- **Indicadores y visualizaciones dinámicas:** tarjetas KPI en tiempo real, ranking Top 10 de entidades convocantes, distribución por modalidad de contratación y una tabla interactiva con búsqueda, ordenamiento, ficha de detalle por CUCE y exportación a CSV.
- **Ejecución sencilla en local:** incluye lanzadores ([iniciar_app.bat](iniciar_app.bat) e [iniciar_app.py](iniciar_app.py)) para levantar el servidor local y abrir la aplicación automáticamente en el navegador.

---

## Origen de los Datos y Agradecimientos

Los datos consumidos por esta aplicación son adquiridos directamente desde el repositorio abierto en GitHub:

- **Repositorio:** [https://github.com/mauforonda/convocatorias_publicas](https://github.com/mauforonda/convocatorias_publicas)

**Sin los datos del repositorio [convocatorias_publicas](https://github.com/mauforonda/convocatorias_publicas) no se podría haber logrado este proyecto.** Su recopilación, estructuración y publicación abierta hacen posible el monitoreo ciudadano y el análisis transparente de las compras estatales en Bolivia.

### Enlaces del autor del repositorio de datos (Mauricio Foronda)

- **Observable:** [https://observablehq.com/@mauforonda](https://observablehq.com/@mauforonda)
- **LinkedIn:** [https://bo.linkedin.com/in/mauforonda](https://bo.linkedin.com/in/mauforonda)
