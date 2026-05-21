# Inventario de Ventas

Aplicación web completa para gestionar inventario, ventas y pagos en cuotas. Sistema integral de control de negocio con interfaz moderna y responsiva.

## 🎯 Características

- **Panel de Control**: Estadísticas en tiempo real de tu negocio
- **Gestión de Inventario**: Agrega, visualiza y controla productos
- **Registro de Ventas**: Registra ventas completas o en cuotas
- **Gestión de Cuotas**: Controla pagos parciales y registra abonos
- **Análisis de Ingresos**: Distribución de ingresos por porcentaje
- **Almacenamiento Local**: Todos los datos se guardan en el navegador

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Framework UI**: Bootstrap 5
- **Iconos**: Font Awesome
- **Almacenamiento**: LocalStorage
- **Responsive**: Mobile, Tablet, Desktop

## 📦 Instalación

1. Clona o descarga el repositorio
2. Abre `index.html` en tu navegador
3. ¡Listo! La aplicación está lista para usar

No requiere instalación de dependencias ni servidor.

## 🚀 Uso

### Agregar Productos
1. Ve a **Productos**
2. Haz clic en **Agregar Producto**
3. Completa: nombre, cantidad, precios, fecha y categoría
4. Opcionalmente personaliza la categoría
5. Haz clic en **Guardar Producto**

### Registrar Ventas
1. Ve a **Ventas** o haz clic en **Vender Producto**
2. Selecciona productos y cantidades
3. Ingresa precios de venta
4. Elige tipo de pago:
   - **Pago Completo**: Pago total inmediato
   - **Pago en Cuotas**: Divide en múltiples pagos
5. Ingresa nombre del cliente
6. Haz clic en **Completar Venta**

### Gestionar Cuotas
1. Ve a **Cuotas**
2. Visualiza todas las cuotas pendientes
3. Haz clic en **Registrar Pago** para abonar
4. Ingresa el monto a pagar
5. El sistema actualiza automáticamente el estado

### Ver Análisis
1. Ve a **Análisis**
2. Visualiza tabla con distribución de ingresos:
   - 40% de cada venta
   - 30% de cada venta
   - 20% de cada venta
   - 10% de cada venta
3. Detalles completos de todas las ventas

## 💾 Almacenamiento de Datos

- Todos los datos se guardan en **LocalStorage** del navegador
- Los datos persisten entre sesiones
- Si limpias el caché del navegador, los datos se perderán
- Se recomienda hacer backups periódicos

## 📱 Responsividad

- ✅ Desktop (1920px+)
- ✅ Laptop (1024px - 1920px)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (360px - 768px)

## 🎨 Diseño

- Interfaz moderna con gradientes
- Sidebar navegable
- Modales para operaciones
- Tablas paginadas
- Estadísticas en tiempo real
- Animaciones suaves

## 📊 Funcionalidades Principales

### Dashboard
- Total de productos en inventario
- Ventas totales acumuladas
- Ganancia total
- Artículos vendidos

### Caja Registradora
- Ingresos totales
- Costo total de productos
- Ganancia neta
- Cantidad de productos vendidos

### Cuotas
- Total de cuotas activas
- Monto pagado
- Monto pendiente
- Porcentaje de pago

### Análisis
- Desglose de ingresos por porcentaje
- Tabla detallada de ventas
- Información de cliente y productos
- Fechas de transacción

## 🔧 Estructura del Proyecto

```
├── index.html          # Estructura HTML
├── style.css           # Estilos CSS
├── app.js              # Lógica principal
├── installments.js     # Gestión de cuotas
└── README.md           # Este archivo
```

## 💡 Notas Importantes

- Los datos se guardan automáticamente después de cada operación
- No se requiere conexión a internet
- Funciona completamente offline
- Compatible con todos los navegadores modernos

## 🎓 Caso de Uso

Ideal para:
- Pequeños negocios
- Tiendas online
- Vendedores independientes
- Control de inventario personal
- Gestión de pagos en cuotas

## 📝 Licencia

MIT - Libre para usar y modificar

## 👨‍💻 Autor

Proyecto de portafolio - Sistema de Inventario de Ventas

---

**Última actualización**: Mayo 2026
