# Administrador de Archivos - Contexto de Desarrollo

## Nombre del Proyecto
**Administrador de Archivos**

## Rol del PM (Orquestador)

El PM (Claude) actua como Project Manager orquestando las solicitudes entre los agentes especializados. Ante cada peticion del usuario:

1. Analiza el requerimiento y lo descompone en tareas por agente
2. Asigna tareas al agente correspondiente (Frontend, Backend, Infraestructura, Revisor)
3. Coordina dependencias entre agentes
4. Valida que las entregas cumplan con los lineamientos de este documento
5. Reporta avance al usuario

---

## Agente Frontend - Desarrollador React

### Stack y Herramientas
- **Framework:** React 18+ con Vite como bundler
- **Lenguaje:** TypeScript (estricto)
- **Estilos:** Archivos CSS/SCSS de la carpeta `styles/` (estilos compartidos del proyecto). No usar Tailwind ni CSS Modules como sistema principal; los estilos globales y tematicos viven en `styles/`
- **Estado:** React Context + useReducer para estado global; useState para estado local
- **HTTP Client:** Axios con interceptors centralizados
- **Ruteo:** React Router v6+

### Principios de Arquitectura
- **Componentizacion maxima:** cada pieza de UI debe ser un componente reutilizable
- **Estructura de carpetas:**
  ```
  src/
    components/       # Componentes reutilizables (Button, Input, Modal, Table, etc.)
      ui/             # Componentes base/atomicos
      layout/         # Header, Footer, Sidebar, PageWrapper
      shared/         # Componentes compartidos entre features
    features/         # Modulos por funcionalidad (cada uno con sus componentes propios)
      [feature]/
        components/   # Componentes exclusivos del feature
        hooks/        # Custom hooks del feature
        services/     # Llamadas API del feature
        types/        # Tipos TypeScript del feature
        index.tsx     # Barrel export
    hooks/            # Custom hooks globales
    services/         # Servicios API globales y configuracion de Axios
    styles/           # Estilos globales y tematicos del proyecto
      variables.css   # Variables CSS (colores, tipografia, espaciado)
      reset.css       # Reset/normalize
      global.css      # Estilos globales base
      components/     # Estilos reutilizables por componente
      layout.css      # Estilos de layout general
    types/            # Tipos e interfaces globales
    utils/            # Funciones utilitarias puras
    context/          # Providers de contexto global
    config/           # Constantes y configuracion
    App.tsx
    main.tsx
  ```

### Buenas Practicas Obligatorias
- **DRY:** No duplicar logica. Si un patron se repite 2 veces, extraer a componente o hook
- **Single Responsibility:** Un componente = una responsabilidad
- **Props tipadas:** Toda prop debe tener su interface TypeScript
- **Custom Hooks:** Extraer logica de estado/efectos a hooks reutilizables
- **Composicion sobre herencia:** Usar children y render props
- **Memoizacion:** Usar React.memo, useMemo y useCallback donde haya renders innecesarios
- **Barrel exports:** Cada carpeta con su index.ts para imports limpios
- **Nombres descriptivos:** Componentes en PascalCase, hooks con prefijo `use`, utilidades en camelCase
- **Sin logica de negocio en componentes:** Delegarla a hooks o servicios
- **Manejo de errores:** Error Boundaries para componentes, try/catch en servicios
- **Loading states:** Todo componente async debe manejar loading, error y empty states
- **Estilos centralizados:** Los estilos visuales se gestionan desde la carpeta `styles/`. Los componentes importan los estilos correspondientes desde alli. Usar variables CSS para colores, tipografia y espaciado. No escribir estilos inline salvo excepciones justificadas

### Compilacion y Despliegue
- La compilacion se realiza **localmente** con `npm run build` (o `yarn build`)
- El resultado del build (carpeta `dist/`) se copia manualmente a `./html/`
- **No se construye en Docker.** El contenedor nginx solo sirve los archivos estaticos

### Variables de Entorno
- Usar archivos `.env` y `.env.production` con prefijo `VITE_`
- La URL del backend se configura via `VITE_API_URL`

---

## Agente Backend - Desarrollador .NET Core

### Stack y Herramientas
- **Framework:** .NET 8+ (ASP.NET Core Web API)
- **Lenguaje:** C# 12+
- **ORM:** Entity Framework Core
- **Base de Datos:** SQL Server 2022 (servidor 10.1.1.168:1433)
- **Documentacion API:** Swagger/OpenAPI (Swashbuckle)
- **Validacion:** FluentValidation
- **Mapeo:** AutoMapper o Mapster

### Arquitectura Hexagonal (Ports & Adapters)

```
Solution/
  src/
    [Proyecto].Domain/              # Nucleo del dominio (sin dependencias externas)
      Entities/                     # Entidades de dominio
      ValueObjects/                 # Objetos de valor
      Enums/                        # Enumeraciones del dominio
      Exceptions/                   # Excepciones de dominio
      Interfaces/                   # Puertos (ports) del dominio
        Repositories/               # Interfaces de repositorios
        Services/                   # Interfaces de servicios de dominio

    [Proyecto].Application/         # Capa de aplicacion (casos de uso)
      DTOs/                         # Data Transfer Objects
        Requests/                   # DTOs de entrada
        Responses/                  # DTOs de salida
      Interfaces/                   # Puertos de aplicacion
      Services/                     # Implementacion de casos de uso
      Mappings/                     # Perfiles de mapeo
      Validators/                   # Validaciones con FluentValidation
      Common/                       # Comportamientos transversales

    [Proyecto].Infrastructure/      # Adaptadores de salida
      Persistence/
        Context/                    # DbContext de EF Core
        Configurations/             # Fluent API configurations
        Repositories/               # Implementacion de repositorios
        Migrations/                 # Migraciones de EF Core
      Services/                     # Implementacion de servicios externos

    [Proyecto].API/                 # Adaptador de entrada (HTTP)
      Controllers/                  # Controladores REST
      Middleware/                   # Middleware personalizado
      Filters/                      # Filtros de accion
      Extensions/                   # Metodos de extension para configuracion
      Program.cs                    # Entry point y configuracion DI
      appsettings.json
      Dockerfile
```

### Principios Obligatorios
- **Dependency Inversion:** El dominio NO depende de infraestructura. Las dependencias apuntan hacia adentro
- **Puertos y Adaptadores:** Interfaces (puertos) en Domain/Application; implementaciones (adaptadores) en Infrastructure/API
- **Inyeccion de dependencias:** Todo se registra en el contenedor DI de .NET
- **Repository Pattern:** Acceso a datos solo a traves de repositorios con interfaz en Domain
- **CQRS ligero:** Separar operaciones de lectura y escritura en los servicios de aplicacion
- **Respuestas estandarizadas:** Usar un wrapper `ApiResponse<T>` para todas las respuestas
- **Manejo global de excepciones:** Middleware centralizado para excepciones
- **Logging estructurado:** Usar ILogger con Serilog

### Swagger - Documentacion Obligatoria
- **Toda** ruta debe estar documentada con:
  - Summary y Description en el endpoint
  - ProducesResponseType para cada codigo HTTP posible (200, 201, 400, 404, 500)
  - Ejemplos en los DTOs con `/// <summary>` XML comments
  - Tags para agrupar endpoints por recurso
- Swagger UI habilitado en todos los ambientes
- Configurar informacion de contacto y version de la API

### Conexion a Base de Datos
- **Servidor:** 10.1.1.168
- **Puerto:** 1433
- **Connection String:** `Server=10.1.1.168,1433;Database={NOMBRE_DB};User Id=sa;Password=SqlServer2024!;TrustServerCertificate=true`
- Las credenciales completas estan en `infraestructura.md`
- La base de datos se crea via migraciones de EF Core

### Construccion y Despliegue
- El backend **se construye dentro de Docker** usando multi-stage build
- El Dockerfile debe estar en la raiz del proyecto .NET
- Exponer puerto configurable via variable de entorno

---

## Agente Infraestructura

### Responsabilidades
- Crear y mantener los archivos `docker-compose.yml`
- Configurar la red, volumenes y variables de entorno
- Garantizar que los contenedores se comuniquen correctamente

### Docker Compose Principal - Aplicacion (`docker-compose.yml`)

#### Red
- **Subred:** 172.16.5.0/24
- **Gateway:** 172.16.5.1
- **Asignacion de IPs:** desde 172.16.5.10 en adelante
- **Nombre de red:** `app-network`

#### Contenedores

| Contenedor | Imagen | IP | Puerto Host | Puerto Container | Notas |
|---|---|---|---|---|---|
| frontend | nginx:alpine | 172.16.5.10 | 8080 | 80 | Sirve `./html` como root |
| backend | build local | 172.16.5.11 | 5000 | 8080 | Multi-stage build .NET |

#### Volumen compartido Frontend
```yaml
volumes:
  - ./html:/usr/share/nginx/html:ro
```

#### Backend - Build
```yaml
build:
  context: ./backend  # o la ruta al proyecto .NET
  dockerfile: Dockerfile
```

#### Configuracion nginx
- Crear `nginx.conf` con:
  - Servir archivos estaticos desde `/usr/share/nginx/html`
  - Proxy reverso a `/api/*` redirigiendo al backend
  - Gzip habilitado
  - Cache headers para assets estaticos
  - SPA fallback: `try_files $uri $uri/ /index.html`

### Docker Compose SonarQube - Calidad (`docker-compose.sonar.yml`)

#### Red
- Misma subred `app-network` o red dedicada para calidad

#### Contenedores

| Contenedor | Imagen | IP | Puerto Host | Proposito |
|---|---|---|---|---|
| sonarqube-quality | sonarqube:community | 172.16.5.20 | 9000 | Analisis de calidad de codigo |
| sonarqube-db-quality | postgres:15 | 172.16.5.21 | - | BD para SonarQube calidad |
| sonarqube-owasp | sonarqube:community | 172.16.5.22 | 9001 | Analisis de seguridad OWASP |
| sonarqube-db-owasp | postgres:15 | 172.16.5.23 | - | BD para SonarQube OWASP |

#### Notas SonarQube
- Cada instancia SonarQube requiere su propia base de datos PostgreSQL
- La instancia de **calidad** se configura con Quality Profiles estandar (reglas de code smells, bugs, duplicacion, cobertura)
- La instancia **OWASP** se configura con el plugin OWASP Dependency-Check y Quality Profile enfocado en seguridad (OWASP Top 10, injection, XSS, etc.)
- Ambos SonarQube deben tener volumenes persistentes para datos y extensiones/plugins

---

## Agente Revisor de Codigo

### Responsabilidades
- Ejecutar analisis de calidad contra SonarQube Quality (puerto 9000)
- Ejecutar analisis de seguridad contra SonarQube OWASP (puerto 9001)
- Reportar hallazgos al PM para su comunicacion al usuario
- Sugerir correcciones cuando se encuentren issues criticos o bloqueantes

### Herramientas
- **sonar-scanner** para proyectos frontend (React/TypeScript)
- **dotnet-sonarscanner** para proyectos backend (.NET)

### Umbrales de Calidad (Quality Gate)
- **Calidad:**
  - Bugs: 0 nuevos bloqueantes o criticos
  - Code Smells: maximo 5 nuevos major
  - Duplicacion: menor a 3%
  - Cobertura: minimo 80% en codigo nuevo
- **Seguridad OWASP:**
  - Vulnerabilidades: 0 criticas o altas
  - Security Hotspots: todos revisados
  - OWASP Top 10: sin violaciones

---

## Flujo de Trabajo General

```
Usuario -> PM (Claude)
             |
             +---> Agente Frontend (React)     -> Compila -> ./html/
             |
             +---> Agente Backend (.NET Core)   -> Dockerfile -> Docker Build
             |
             +---> Agente Infraestructura       -> docker-compose.yml
             |                                  -> docker-compose.sonar.yml
             |
             +---> Agente Revisor               -> SonarQube Quality (9000)
                                                -> SonarQube OWASP (9001)
```

### Secuencia tipica de un requerimiento:
1. El usuario describe la funcionalidad deseada
2. El PM descompone en tareas para cada agente
3. Backend desarrolla la API (endpoints, logica, migraciones)
4. Frontend desarrolla la UI (componentes, integracion con API)
5. Infraestructura actualiza docker-compose si es necesario
6. Revisor ejecuta analisis de calidad y seguridad
7. PM consolida resultados y reporta al usuario
8. Una vez validado, se sube el codigo al repositorio GitHub

### Control de Versiones - GitHub
- **Repositorio:** Pendiente de creacion (se configurara en breve)
- **Estrategia de ramas:**
  - `main` — codigo estable y validado
  - `develop` — integracion de features
  - `feature/<nombre>` — ramas por funcionalidad
  - `hotfix/<nombre>` — correcciones urgentes
- **Flujo de subida:**
  1. El codigo pasa revision del Agente Revisor (calidad + OWASP)
  2. Solo se sube a GitHub codigo que haya superado los umbrales de calidad
  3. Se hace commit con mensajes descriptivos siguiendo conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)
  4. Push a la rama correspondiente y PR hacia `develop`
- **Estructura del repositorio:** Todo el proyecto (frontend, backend, infraestructura, configs) vive en un monorepo
- **`.gitignore`:** Debe excluir `node_modules/`, `bin/`, `obj/`, `.env`, `html/` (artefactos compilados), volumenes de Docker

---

## Estructura de Directorios del Proyecto

```
administrador-de-archivos/       # Raiz del proyecto
  desarrollo.md                  # Este archivo (contexto de trabajo)
  infraestructura.md             # Credenciales y servicios del servidor
  frontend/                      # Codigo fuente React (Administrador de Archivos)
  backend/                       # Codigo fuente .NET Core (Administrador de Archivos)
  html/                          # Build compilado del frontend (servido por nginx)
  nginx/
    nginx.conf                   # Configuracion de nginx
  docker-compose.yml             # Compose principal (frontend + backend)
  docker-compose.sonar.yml       # Compose de SonarQube (calidad + OWASP)
```
