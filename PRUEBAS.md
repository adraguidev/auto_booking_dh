# Guía de Pruebas AutoBooking

## Requisitos previos

1. Asegúrate de tener PostgreSQL instalado y ejecutándose en tu sistema.
2. Crea una base de datos llamada `autobookingdb` (si no existe).

```sql
CREATE DATABASE autobookingdb;
```

## Iniciar el backend

1. Navega al directorio del backend:

```bash
cd backend
```

2. Ejecuta la aplicación Spring Boot:

```bash
mvn spring-boot:run
```

3. Si necesitas reiniciar completamente la base de datos con datos de ejemplo, puedes ejecutar:

```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--init-db"
```

## Iniciar el frontend

1. Abre una nueva terminal y navega al directorio del frontend:

```bash
cd frontend
```

2. Ejecuta la aplicación React:

```bash
npm run dev
```

3. Abre tu navegador en [http://localhost:5173](http://localhost:5173)

## Credenciales para pruebas

- **Administrador**:
  - Email: admin@example.com
  - Contraseña: password123

- **Cliente**:
  - Email: cliente@example.com
  - Contraseña: password123

## Puntos a verificar

### Categorías (Administrador)

1. Inicia sesión como administrador
2. Navega a la sección "Categorías" en el panel de administración
3. Verifica que puedes ver las categorías precargadas (Sedán, SUV, etc.)
4. Crea una nueva categoría (por ejemplo, "Minivan")
5. Verifica que aparece en la lista
6. Elimina la categoría recién creada
7. Confirma que ha sido eliminada de la lista

### Productos con categorías (Administrador)

1. Navega a "Agregar producto" en el panel de administración
2. Completa el formulario con datos de prueba
3. Selecciona una categoría del desplegable
4. Guarda el producto
5. Verifica que aparece en la lista de productos con la categoría seleccionada

### Visualización de categorías (Usuario)

1. Navega a la página principal
2. Verifica que se muestran las categorías precargadas
3. Verifica que se muestran los productos con sus respectivas categorías

## Solución de problemas

### Base de datos

Si tienes problemas con la base de datos:

1. Verifica que PostgreSQL esté ejecutándose:
   ```bash
   sudo service postgresql status  # Linux
   pg_ctl -D /usr/local/var/postgres status  # macOS
   ```

2. Verifica las credenciales en `application.properties`

3. Puedes reiniciar la base de datos desde cero:
   ```sql
   DROP DATABASE autobookingdb;
   CREATE DATABASE autobookingdb;
   ```

### API Backend

Para probar directamente los endpoints:

1. Listar categorías:
   ```bash
   curl http://localhost:8080/api/categories
   ```

2. Listar productos:
   ```bash
   curl http://localhost:8080/api/products
   ``` 