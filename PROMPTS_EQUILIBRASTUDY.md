# PROMPTS DE IMPLEMENTACIÓN — EquilibraStudy
> Prompts secuenciales para construir el sistema fase por fase
> Plan de referencia: `doc/PLAN_EQUILIBRASTUDY.md`
> Estado de progreso: `doc/ESTADO_EJECUCION_EQUILIBRASTUDY.md`

---

## INSTRUCCIONES DE USO

1. Ejecuta primero el **Prompt 0** — crea el archivo de seguimiento del proyecto.
2. Para cada fase siguiente, copia el bloque completo y pégalo en tu sesión de IA.
3. La IA leerá el plan, ejecutará la fase y dejará el estado actualizado.
4. No avances a la siguiente fase hasta que el resumen esté generado y el estado marcado como completado.

---

## PROTOCOLO DE EJECUCIÓN — APLICA A TODOS LOS PROMPTS

```
ANTES de escribir código:
1. Leer doc/PLAN_EQUILIBRASTUDY.md
2. Leer doc/ESTADO_EJECUCION_EQUILIBRASTUDY.md
3. Verificar que las fases previas estén completadas
4. Registrar inicio: estado En progreso + fecha y hora

DESPUÉS de completar el trabajo:
5. Registrar cierre: estado Completada + fecha y hora
6. Documentar: acciones ejecutadas, archivos creados/modificados, observaciones
7. Crear doc/RESUMEN_FASE_N_NOMBRE.md con: objetivo, acciones, archivos,
   decisiones técnicas y por qué, problemas encontrados y resolución,
   qué se probó y resultado, estado final EXITOSO / CON OBSERVACIONES / FALLIDO,
   prerrequisitos para la siguiente fase

NUNCA avanzar sin completar este protocolo.
```

---

---

## PROMPT 0 — Crear archivo de estado del proyecto

```
Actúa como Ingeniero de Proyectos. Tu única tarea es leer
doc/PLAN_EQUILIBRASTUDY.md y crear el archivo
doc/ESTADO_EJECUCION_EQUILIBRASTUDY.md.

El archivo debe contener:
- Información del proyecto: nombre, archivos de referencia, estudiante,
  fecha de inicio, estado general
- Dashboard de fases: tabla con todas las fases del plan incluyendo número,
  nombre, rol asignado, estado (todas inician como Pendiente), columnas para
  fecha de inicio, fecha de cierre y archivo de resumen
- Leyenda de estados: Pendiente, En progreso, Completada, Bloqueada, Pausada
- Historial de ejecución: sección append-only con fecha, hora, fase, evento y detalle

Toma los datos directamente del plan. No inventes fases ni cambies nombres ni roles.

Cuando termines escribe en el chat el nombre de cada fase detectada y confirma
que el archivo está listo para comenzar la Fase 1.

Tu trabajo termina aquí.
```

---

---

## PROMPT FASE 1 — Bootstrap, Login, Registro y `dataService` base

### Rol: `Ingeniero Fullstack Senior — Arquitecto del sistema, persistencia y seguridad`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en
arquitectura de persistencia serverless, autenticación segura con JWT y
diseño de la primera experiencia visual de una aplicación de bienestar
estudiantil.

Tu mentalidad: EquilibraStudy mide el tiempo de estudio real de un estudiante
y cuida su bienestar cognitivo. Eso significa que los datos del usuario son
profundamente personales — sus sesiones, su fatiga, sus metas. La arquitectura
de persistencia garantiza que esos datos sean completamente privados y siempre
accesibles. La identidad visual del login debe transmitir el tono correcto:
energía productiva y calma al mismo tiempo.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_EQUILIBRASTUDY.md — secciones 8 (stack y variables de entorno),
   9 (reglas de oro — especialmente la regla 7 sobre el PomodoroTimer y
   localStorage, y la regla 8 sobre dónde se evalúa RN-04), 10 (estructura
   del seed.json — solo el super admin), 11 (estructura de lib/ y la API
   pública del dataService), 13 (blobAudit) y 17 (identidad visual —
   paleta Pastel Vibrante, tipografía Inter 500, colores por sección)
2. doc/ESTADO_EJECUCION_EQUILIBRASTUDY.md — registra el inicio de la Fase 1

Puntos críticos que no puedes ignorar:

— EquilibraStudy tiene registro público — el estudiante crea su propia cuenta.
  Al registrarse, el rol asignado es siempre 'estudiante'. Nunca permitir
  que el cliente envíe el rol en el body del registro.

— El token de Blob se accede siempre con getBlobToken() como función lazy,
  nunca como constante de módulo. Si lo defines como const TOKEN =
  process.env.BLOB_READ_WRITE_TOKEN al nivel del módulo, fallará en
  build time porque las variables de entorno no existen en ese momento.

— La auditoría usa get() del SDK de @vercel/blob, nunca fetch(url). Los
  blobs privados devuelven 401 silencioso con fetch.

— withFileLock serializa escrituras al mismo archivo de auditoría dentro
  de la misma instancia serverless.

— dataService.ts es el ÚNICO archivo que importa supabase.ts y blobAudit.ts.
  Ninguna API Route ni componente importa esos módulos directamente.

— La identidad visual del login sigue la filosofía Pastel Vibrante del plan:
  fondo blanco #FFFFFF, logo SVG de balance+estudio, paleta con cian brillante
  como color de acción, tipografía Inter 500 (no bold pesado), sin degradados,
  sin sombras decorativas. El botón de "Ingresar" tiene bg #00C8F5 y texto
  #003D4D — nunca texto blanco sobre pastel.

— El registro público tiene link desde el login ("¿No tienes cuenta?
  Regístrate") y viceversa. La cuenta se activa inmediatamente sin
  verificación de correo en v1.

Al terminar:
- npm run typecheck — cero errores
- Probar: registro de nuevo estudiante → cuenta activa → login → cookie
  HttpOnly verificada en DevTools → /api/system/mode retorna 'seed'
- Registra el cierre en ESTADO_EJECUCION_EQUILIBRASTUDY.md
- Crea doc/RESUMEN_FASE_1_BOOTSTRAP.md

Tu trabajo termina aquí. No avances a la Fase 2.
```

---

---

## PROMPT FASE 2 — Dashboard, Layout base y página de bootstrap

### Rol: `Diseñador Frontend Obsesivo + Ingeniero de Sistemas`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero de Sistemas
trabajando en conjunto. EquilibraStudy tiene un sistema de diseño muy específico
documentado en el plan: Pastel Vibrante, sin degradados, colores con significado
semántico por sección, texto oscuro sobre pastel. Esta fase establece el sistema
visual que todas las fases siguientes deben respetar.

Tu mentalidad: el dashboard de EquilibraStudy es la primera pantalla que el
estudiante ve cada vez que abre la app. Tiene que responder en segundos:
¿cuánto he estudiado hoy?, ¿tengo algún examen próximo?, ¿puedo empezar
una sesión ahora? Si esas respuestas requieren navegar, el dashboard falló.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_EQUILIBRASTUDY.md — sección 17 completa (toda la especificación
   de diseño: paleta, tipografía, reglas de "no hacer", componentes clave
   con sus colores exactos), la Fase 2 del plan, los componentes GoalProgressBar
   y SeedModeBanner
2. doc/ESTADO_EJECUCION_EQUILIBRASTUDY.md — verifica Fase 1 completada,
   registra inicio de Fase 2

Puntos críticos que no puedes ignorar:

— El sistema de colores de EquilibraStudy es el más específico de todos los
  proyectos. Cada sección tiene su color dominante y cada botón tiene colores
  definidos de texto y fondo. No improvisar ni sustituir por colores similares.
  Usar exactamente los hex del plan. En particular, texto oscuro sobre pastel:
  bg #00C8F5 texto #003D4D — nunca texto blanco sobre fondo cian.

— Las variables CSS de la paleta deben estar en globals.css para poder
  reutilizarlas en todos los componentes. Definirlas como variables CSS
  custom properties: --color-cian, --color-verde-menta, etc.

— El sidebar de EquilibraStudy tiene exactamente 5 ítems para el estudiante:
  Inicio (amarillo sol), Zona de Enfoque (cian), Calendario (azul claro),
  Analytics (lavanda), Perfil (gris neutro). El super admin ve además
  Administración. Los iconos tienen el color semántico de su sección.

— El GoalProgressBar en el dashboard muestra la barra en Amarillo Sol
  (#F5D800 con texto #6B5A00). Si el estudiante no tiene meta semanal
  configurada aún, muestra un empty state invitando a configurarla.

— El botón grande "Iniciar Sesión de Estudio" en el dashboard tiene bg
  #00C8F5 y texto #003D4D. Es la CTA más importante de toda la app.

— El banner del modo seed es el estándar del curso (fondo amarillo, texto
  tierra) pero en EquilibraStudy solo lo ve el super admin.

Al terminar:
- Probar con ambos roles: estudiante (sin Admin en sidebar) y super admin
  (con Admin en sidebar)
- Verificar que los colores son exactamente los del plan en todos los
  componentes creados
- Verificar responsive en 375px, 768px y 1280px
- Probar bootstrap completo: admin → db-setup → ejecutar → modo live
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_2_DASHBOARD.md

Tu trabajo termina aquí. No avances a la Fase 3.
```

---

---

## PROMPT FASE 3 — Calendario Académico

### Rol: `Ingeniero Fullstack + Diseñador Frontend — Eventos académicos y detección de urgencia`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack y Diseñador Frontend trabajando
en conjunto. El calendario académico de EquilibraStudy no es una agenda
genérica — es la fuente de datos que alimenta la inteligencia del sistema.
Sin eventos registrados, el Pomodoro inteligente no puede sugerir nada.

Tu mentalidad: el estudiante registra sus exámenes y entregas aquí. La
calidad visual importa — un examen de mañana debe saltar a la vista de
inmediato en Naranja Coral. El formulario de creación debe ser tan rápido
que el estudiante lo complete en 20 segundos.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_EQUILIBRASTUDY.md — migration 0002 (academic_events), la API
   de dataService para eventos (getAcademicEvents, getUrgentEvents),
   los colores de las etiquetas de prioridad (Alta: #FFE9D6/#8A3C10,
   Media: #FFF6C2/#8A7A00, Baja: #D6FFE9/#0D6B35), la definición de
   "evento urgente" (Alta + deadline < 48h) y la Fase 3 del plan
2. doc/ESTADO_EJECUCION_EQUILIBRASTUDY.md — verifica Fases 1 y 2 completadas,
   registra inicio de Fase 3

Puntos críticos que no puedes ignorar:

— getUrgentEvents filtra: priority='alta' AND deadline < NOW() + 48h AND
  is_active = true. Esta query se usa tanto en el dashboard (para mostrar
  el evento más próximo en naranja coral) como en la sugerencia inteligente
  del Pomodoro (Fase 4). Es la conexión entre el calendario y el motor.

— Los eventos urgentes se muestran en el calendario con el color Naranja Coral
  (#FF8040) en el fondo de la tarjeta y borde correspondiente (#CC6633 aprox).
  Los eventos de prioridad Media/Baja usan Azul Claro (#4DA6FF / fondo #D6ECFF).
  Un estudiante debe poder ver a simple vista qué exámenes son urgentes sin
  leer el texto.

— El formulario de evento es simple: nombre del evento, fecha y hora límite,
  prioridad (selector visual con los tres colores, no solo texto) y notas
  opcionales. No hay más campos. La prioridad por defecto es 'media'.

— Al eliminar un evento: confirmación modal con el nombre del evento en el
  mensaje. "¿Eliminar 'Examen de Cálculo'? Esta acción no se puede deshacer."
  No usar un modal genérico sin contexto.

— La vista del calendario es una grilla mensual simple con los días del mes.
  Cada día muestra los eventos de ese día con su badge de prioridad. Al hacer
  clic en un evento, abre el modal de detalle/edición. Al hacer clic en un
  día vacío, abre el formulario de creación con la fecha pre-llenada.

— En el dashboard, si hay eventos urgentes, el más próximo aparece como una
  tarjeta en Naranja Coral con el nombre del evento, la fecha y un badge
  "URGENTE". Esto es la conexión visual que le recuerda al estudiante por
  qué debe estudiar hoy.

Al terminar:
- Crear eventos con las tres prioridades → verificar colores correctos
- Crear evento Alta con deadline en 24h → verificar que aparece en el
  dashboard como urgente con el naranja coral correcto
- Crear evento Alta con deadline en 72h → verificar que NO aparece como
  urgente (fuera de las 48h)
- Probar eliminación con modal contextual
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_3_CALENDARIO.md

Tu trabajo termina aquí. No avances a la Fase 4.
```

---

---

## PROMPT FASE 4 — Zona de Enfoque (Pomodoro)

### Rol: `Ingeniero Fullstack Senior — Módulo central del sistema con reglas complejas`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en
temporizadores de alta precisión en entornos de navegador, lógica de sesiones
con criterios de validación complejos, y diseño de flujos de concentración
inmersivos.

Tu mentalidad: la Zona de Enfoque es la razón de existir de EquilibraStudy.
Aquí el estudiante pone la cabeza abajo y estudia. La interfaz debe desaparecer
— solo el tiempo restante y el nombre de la tarea. Las reglas de negocio RN-01,
RN-02, RN-04 y RN-05 convergen en este módulo. Si alguna falla, la promesa
del producto se rompe.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_EQUILIBRASTUDY.md — migration 0003 (study_sessions con todos sus
   campos), las cuatro reglas de negocio RN-01 al RN-05 con sus implementaciones
   técnicas exactas, lib/sessionService.ts con las tres funciones y su lógica,
   los componentes PomodoroTimer, SessionSuggestion, BlockedState y
   FatigueSelector con sus especificaciones de diseño, y la Fase 4 completa
2. doc/ESTADO_EJECUCION_EQUILIBRASTUDY.md — verifica Fases 1 a 3 completadas,
   registra inicio de Fase 4

Puntos críticos que no puedes ignorar en el orden correcto:

PRIMERO — getContinuousStudyMinutes (RN-01):
Al cargar /focus, el servidor consulta la sesiones del día del usuario ordenadas
por ended_at DESC. Recorre hacia atrás: cuando encuentra un gap >= 15 min entre
el final de una sesión y el inicio de la siguiente, se detiene. La suma de
effective_minutes de las sesiones anteriores al gap es el total continuo.
Si ese total >= 120, retornar el BlockedState. Si no, continuar al paso de
la sugerencia. Esta lógica vive en sessionService.getContinuousStudyMinutes().

SEGUNDO — getSmartSuggestion (RN-05):
Consultar getUrgentEvents(userId). Si hay al menos un evento urgente:
sugerencia = { work_min: 50, break_min: 10, reason: "Tienes [nombre] en Xh" }.
Si no: sugerencia = { work_min: 25, break_min: 5, reason: null }.
El componente SessionSuggestion muestra esta sugerencia con su justificación.
Dos botones: "Aceptar sugerencia" y "Configurar manualmente".
Si elige manualmente: un formulario con sliders o inputs para work_min y
break_min. Antes de iniciar, validar RN-02 en el servidor (break_min >=
floor(work_min / 25) * 5).

TERCERO — PomodoroTimer (en el cliente):
El timer usa Date.now() como referencia SIEMPRE. Nunca como contador de
setInterval. La forma correcta:
  const startTime = Date.now();
  const interval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = totalMs - elapsed;
    if (remaining <= 0) { clearInterval(interval); onComplete(); }
    setTimeLeft(remaining);
  }, 250); // 250ms para suavidad visual

Guardar en localStorage: { startTime, totalMs, phase: 'work'|'break',
pauseCount, pauseStartTime, pauseCountOver1min, workDurationMin,
breakDurationMin, wasSuggested }.
Al cargar /focus, detectar si hay una sesión activa en localStorage y
restaurar el timer desde ese estado.

Al pausar: guardar pauseStartTime = Date.now() en localStorage.
Al reanudar: calcular pauseDuration = Date.now() - pauseStartTime. Si
pauseDuration > 60000ms (1 minuto), incrementar pauseCountOver1min.

CUARTO — FatigueSelector (post-sesión):
Modal que aparece al finalizar el timer. 5 íconos: 😴😕😐🙂⚡ para los
niveles 1-5. El estudiante selecciona uno y hace clic en "Guardar sesión".

QUINTO — POST /api/sessions (RN-04):
El cliente envía: { work_duration_min, break_duration_min, pause_count_over_1min,
fatigue_level, was_suggested, started_at, ended_at }.
El servidor llama evaluateSessionStatus(pause_count_over_1min, work_duration_min):
  Si pause_count_over_1min <= 2 → status='completada', effective_minutes = work_duration_min
  Si pause_count_over_1min > 2 → status='incompleta', effective_minutes = 0
Guarda la sesión. Responde con { session, continuous_minutes_today } para
que el cliente actualice el dashboard. Limpia localStorage del timer.

SEXTO — BlockedState (RN-01 activo):
Si getContinuousStudyMinutes >= 120, mostrar el BlockedState en lugar del
PomodoroTimer. Fondo Verde Menta (#D6FFE9), texto #074D22. Mensaje:
"Has acumulado 120 min de estudio continuo. Tómate al menos 15 min de
descanso antes de continuar." Con una cuenta regresiva del tiempo restante
de descanso (calculada en el cliente con Date.now() desde la última sesión).

SÉPTIMO — Alerta sonora (RF-06):
Al llegar el timer a cero: Web Audio API básica.
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  osc.frequency.value = 880; // Hz
  osc.connect(ctx.destination);
  osc.start();
  setTimeout(() => osc.stop(), 800); // 0.8 segundos
Web Audio API requiere que el usuario haya interactuado con la página antes
de funcionar en iOS Safari. Documentar en RS-02 del plan.

Al terminar:
- Probar sugerencia inteligente: crear evento urgente → ir a /focus → verificar
  que sugiere 50/10 con el nombre del evento
- Probar sugerencia normal: sin eventos urgentes → verificar que sugiere 25/5
- Probar RN-02: configurar manualmente 50 min de trabajo y 8 min de descanso
  → el servidor debe rechazar (necesita mínimo 10 min)
- Probar RN-04: iniciar sesión de 25 min → pausar 3 veces, 2 de ellas > 1 min →
  al finalizar → verificar que se guarda como 'incompleta' en Supabase
- Probar RN-04 éxito: máximo 2 pausas largas → verificar 'completada'
- Probar timer con recarga: iniciar → recargar la página → el timer debe
  continuar desde el punto correcto
- Probar timer con cambio de tab: iniciar → cambiar de tab por 2 min → volver →
  el timer debe mostrar el tiempo correcto (basado en Date.now())
- Probar RN-01: simular > 120 min acumulados (ajustar datos en Supabase
  directamente) → ir a /focus → debe mostrar BlockedState
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_4_POMODORO.md

Tu trabajo termina aquí. No avances a la Fase 5.
```

---

---

## PROMPT FASE 5 — Metas Semanales y Analytics

### Rol: `Ingeniero Fullstack + Diseñador Frontend — Visualización de progreso académico`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack y Diseñador Frontend trabajando
en conjunto. Los analytics de EquilibraStudy son la herramienta de reflexión
del estudiante. Aquí puede ver si realmente estudia tanto como cree, en qué
horas del día rinde más y si está cumpliendo sus metas. Las gráficas deben
ser honestas y legibles.

Tu mentalidad: las gráficas en Analytics usan Lavanda Viva (#9B59F5) como
color dominante. Las barras de sesiones completadas son sólidas; las de
incompletas son rayadas o más claras — la diferencia debe ser visual e
inmediata. El estudiante no debería necesitar leer leyendas para entender
qué fue productivo y qué no.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_EQUILIBRASTUDY.md — migration 0004 (weekly_goals con UNIQUE
   user_id+week_start), lib/analyticsService.ts y sus funciones, los tipos
   DailyStats/WeeklyStats/MonthlyStats, los componentes de gráficas con
   sus especificaciones de color (cian para completadas, gris para incompletas,
   lavanda para líneas de evolución), el GoalProgressBar en Amarillo Sol, y
   la Fase 5 del plan
2. doc/ESTADO_EJECUCION_EQUILIBRASTUDY.md — verifica Fases 1 a 4 completadas,
   registra inicio de Fase 5

Puntos críticos que no puedes ignorar:

— La meta semanal se guarda con UNIQUE(user_id, week_start), donde week_start
  es siempre el lunes de esa semana. upsertWeeklyGoal hace INSERT ... ON
  CONFLICT (user_id, week_start) DO UPDATE SET goal_hours = EXCLUDED.goal_hours.
  Si el estudiante cambia la meta a mitad de semana, simplemente actualiza la
  misma fila.

— getWeeklyProgress calcula: acumulado_hoy = SUM(effective_minutes WHERE
  started_at BETWEEN week_start AND NOW()) / 60. Meta = weekly_goals.goal_hours
  de esta semana. Si no hay meta configurada, getWeeklyProgress retorna
  { accumulated: N, goal: null, percentage: null }.

— buildDailyStats agrupa las sesiones del día por hora de inicio. Para cada
  hora de 0 a 23: sumar los effective_minutes de sesiones completadas y
  los work_duration_min de sesiones incompletas (que no sumaron). El DailyChart
  muestra barras apiladas: cian para efectivos, gris claro para incompletos.

— buildWeeklyStats agrupa por día de la semana (lunes=1, domingo=7). Para cada
  día: total de horas efectivas. El WeeklyChart es una línea en lavanda.

— buildMonthlyStats agrupa por día del mes. El MonthlyChart son barras en
  lavanda. Incluye también el nivel de fatiga promedio del día si hay datos.

— El selector de vista en /analytics funciona con tres botones tipo tab:
  "Día" (azul activo, gris inactivo), "Semana", "Mes". Al cambiar la vista,
  el componente de gráfica cambia con una transición suave de Framer Motion.
  El rango de fechas se puede ajustar con los selectores de fecha o con
  flechas de navegación.

— Las tarjetas de stats clave debajo de la gráfica muestran:
  Total horas efectivas: en cian (#00C8F5 / #D6F5FF).
  Sesiones completadas: en verde menta (#33D17A / #D6FFE9).
  Sesiones incompletas: en naranja coral claro.
  Fatiga promedio: en rosa vibrante (#F060A8 / #FFD6EE) con el emoji
  correspondiente al valor promedio.

— El formulario de meta semanal vive en el perfil del usuario (/profile)
  como un input numérico con label "Meta de horas semanales:" y botón
  guardar. También puede estar en el propio dashboard como un campo editable
  inline al lado de la GoalProgressBar.

Al terminar:
- Crear varias sesiones (completadas e incompletas) en distintas horas →
  verificar DailyChart muestra la separación correcta entre completadas
  y no completadas
- Configurar meta semanal → verificar GoalProgressBar con el porcentaje correcto
- Cambiar meta a mitad de semana → verificar que se actualiza (upsert correcto)
- Verificar las tres vistas (día/semana/mes) con datos reales
- Verificar el empty state cuando no hay sesiones en el período seleccionado
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_5_ANALYTICS.md

Tu trabajo termina aquí. No avances a la Fase 6.
```

---

---

## PROMPT FASE 6 — Exportación PDF y Perfil

### Rol: `Ingeniero Backend Senior + Diseñador Frontend — Documentos y configuración`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Backend Senior y Diseñador Frontend
trabajando en conjunto. El PDF mensual de EquilibraStudy es el artefacto
que el estudiante puede compartir con un tutor o guardar como registro
de su rendimiento. Debe verse como un documento académico profesional,
no como una captura de pantalla.

Tu mentalidad: el estudiante exporta el PDF al final del mes para reflexionar
sobre su rendimiento. El documento debe ser honesto: muestra tanto las sesiones
completadas como las incompletas, incluye la fatiga promedio y el porcentaje
de meta alcanzado. El botón de exportar tiene el color Amarillo Sol del plan —
la acción positiva de logro.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_EQUILIBRASTUDY.md — la descripción de RF-10 y lo que debe incluir
   el PDF, lib/reportService.ts, la API route de reportes, el botón de
   exportar con sus colores exactos (bg #F5D800 · texto #6B5A00), y la Fase 6
2. doc/ESTADO_EJECUCION_EQUILIBRASTUDY.md — verifica Fases 1 a 5 completadas,
   registra inicio de Fase 6

Puntos críticos que no puedes ignorar:

— generateMonthlyPDF(userId, year, month) hace una query de todas las sesiones
  del mes: SELECT * FROM study_sessions WHERE user_id=? AND DATE_TRUNC('month',
  started_at) = MAKE_DATE(year, month, 1). Si no hay sesiones: retornar 404
  con mensaje "No hay sesiones en [Mes Año] para generar el reporte."

— El PDF con jsPDF incluye:
  Cabecera: "EquilibraStudy — Reporte Mensual" + nombre del usuario + período
  (ej: "Mayo 2026"). Con los colores cian y gris oscuro del sistema de diseño.
  Tabla de sesiones: columnas Fecha, Hora inicio, Duración (min), Estado
  (Completada/Incompleta), Fatiga (1-5 o "—"). Usando jspdf-autotable.
  Sección de resumen: total de horas efectivas, sesiones completadas,
  sesiones incompletas, fatiga promedio del mes, meta semanal promedio
  y porcentaje de semanas en que se alcanzó la meta.
  Pie de página: "Generado por EquilibraStudy · [fecha de generación]".

— El endpoint GET /api/reports/monthly?year=&month= requiere withAuth.
  Retorna el PDF como Buffer con headers: Content-Type: application/pdf y
  Content-Disposition: attachment; filename="equilibrastudy-[usuario]-YYYY-MM.pdf".

— El botón en la vista mensual de Analytics: aparece debajo de la gráfica,
  solo en la vista "Mes". Tiene bg #F5D800 y texto #6B5A00. Al hacer clic,
  muestra un spinner (el PDF puede tardar 2-4 segundos). Si el endpoint
  retorna 404 (sin datos), mostrar toast "No hay sesiones en este mes."

— /profile/page.tsx: nombre (editable), email (solo lectura — mostrar como
  campo deshabilitado con estilo claro), formulario de cambio de contraseña
  (contraseña actual + nueva + confirmar), y formulario de meta semanal
  predeterminada con número de horas. Al guardar la meta, llamar
  upsertWeeklyGoal con la semana actual.

Al terminar:
- Crear varias sesiones → exportar PDF del mes → verificar que se abre
  correctamente en un lector PDF con los datos correctos
- Probar exportar un mes sin sesiones → verificar toast "No hay sesiones"
- Editar el perfil → cambiar contraseña → verificar que la nueva contraseña
  funciona al hacer logout/login
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_6_PDF_PERFIL.md

Tu trabajo termina aquí. No avances a la Fase 7.
```

---

---

## PROMPT FASE 7 — Administración y Pulido final

### Rol: `Diseñador Frontend Obsesivo + Ingeniero Fullstack — Cierre del proyecto`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero Fullstack
trabajando en conjunto. Esta es la fase de cierre de EquilibraStudy.

Tu mentalidad: EquilibraStudy le promete al estudiante equilibrio real entre
productividad y bienestar. Esa promesa tiene componentes técnicos (las reglas
de negocio) y componentes de experiencia (los empty states motivadores, los
mensajes de error claros, la coherencia visual). Esta fase verifica que
todo funciona en producción, que el sistema de diseño es consistente y que
las reglas de negocio no tienen agujeros.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_EQUILIBRASTUDY.md — Fase 7 completa, los requerimientos no
   funcionales RNF-01 al RNF-07 y las restricciones del sistema (sección 20)
2. doc/ESTADO_EJECUCION_EQUILIBRASTUDY.md — verifica Fases 1 a 6 completadas,
   registra inicio de Fase 7

Lo que debes completar en esta fase:

Administración básica:
Crear API Routes con verificación de role='super_admin': GET/POST /api/users,
GET/PUT /api/users/[id]. Crear app/admin/users/page.tsx: tabla con nombre,
email, fecha de registro, estado. Acciones: activar/suspender. Crear
app/admin/audit/page.tsx: AuditViewer con selector de mes.
El super admin NO puede ver las sesiones individuales ni los eventos
académicos de ningún estudiante. Verificar explícitamente que ningún endpoint
de admin expone esos datos.

Auditoría de empty states con el tono de EquilibraStudy:
- Dashboard en primer uso (sin sesiones ni eventos): "Bienvenida a EquilibraStudy.
  Empieza registrando tu próximo examen en el calendario." Con botón que lleva
  a /calendar.
- Analytics sin datos en el período: "Completa tu primera sesión de estudio
  para ver tus estadísticas." Con botón "Ir a Zona de Enfoque".
- Calendario sin eventos: "No tienes eventos académicos registrados. Agrega
  tu primer examen o entrega." Con botón "Agregar evento".
- Historial de sesiones vacío en Analytics: "Aquí aparecerán tus sesiones
  cuando completes tu primer Pomodoro."

Manejo de errores global:
- 401 (sesión expirada): toast "Tu sesión expiró" + redirect a /login.
- 403 con reason='MANDATORY_BREAK': no es un toast — mostrar el BlockedState
  directamente en /focus. No usar el componente de error genérico para esto.
- 403 genérico: toast "No tienes permisos."
- 404 en exportación PDF: toast "No hay sesiones en este período."
- 500: toast genérico con botón "Reintentar".

Verificación completa de las cuatro reglas de negocio en producción:
RN-01: Ajustar datos en Supabase directamente para simular 120+ min acumulados
hoy → ir a /focus → verificar BlockedState con el mensaje correcto y la cuenta
regresiva del descanso.

RN-02: Ir a configuración manual en /focus → intentar configurar 50 min
trabajo / 8 min descanso → el servidor debe rechazar con error descriptivo
(necesita mínimo 10 min de descanso para 50 min de trabajo).

RN-04: Iniciar sesión → pausar manualmente 3 veces, 2 de ellas por más de
1 minuto → finalizar → registrar fatiga → guardar → verificar en Supabase
que status='incompleta' y effective_minutes=0 → verificar que el dashboard
NO suma esos minutos al progreso semanal.

RN-05: Crear evento "Examen de Cálculo" con prioridad Alta y deadline para
dentro de 30 horas → ir a /focus → verificar que la SessionSuggestion muestra
la sugerencia 50/10 con el mensaje "Tienes Examen de Cálculo en 30h".
Luego cambiar el deadline del mismo evento a dentro de 72 horas → volver a
/focus → verificar que la sugerencia vuelve a ser 25/5.

Verificación del sistema de diseño:
Revisar pantalla por pantalla que los colores coinciden exactamente con el
plan: texto oscuro sobre pastel, sin texto blanco sobre colores pastel, sin
degradados, sin sombras decorativas. Si hay algún botón con texto blanco
sobre cian o lavanda — corregirlo.

Verificación del PomodoroTimer en producción:
Iniciar sesión → cambiar de tab por 3 minutos → volver → el tiempo debe
haber avanzado 3 minutos (Date.now() correcto). Recargar la página con
el timer activo → el timer debe continuar desde donde estaba (localStorage
correcto). Completar el ciclo de trabajo → la alerta sonora debe funcionar
en Chrome y Firefox al menos.

Para el cierre técnico:
- npm run typecheck — cero errores
- npm run lint — cero warnings
- npm run build — build exitoso
- Verificar que ningún componente cliente importa variables privadas ni
  módulos de lib/ directamente
- Deploy en Vercel con todas las variables de entorno:
  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, BLOB_READ_WRITE_TOKEN,
  JWT_SECRET, ADMIN_BOOTSTRAP_SECRET

Probar en producción el flujo completo:
Registro → bootstrap (admin) → crear evento urgente → ir a Zona de Enfoque →
ver sugerencia 50/10 → aceptar → completar sesión con máx. 2 pausas →
registrar fatiga → ver actualización en dashboard → ver stats en Analytics →
exportar PDF del mes.

Al cerrar el proyecto:
- Registra la Fase 7 como Completada en ESTADO_EJECUCION_EQUILIBRASTUDY.md
  con la URL de producción en el historial
- Crea doc/RESUMEN_FASE_7_PULIDO_FINAL.md con: URL de producción, URL del
  repositorio, funcionalidades implementadas, stack, tablas de Supabase,
  decisiones técnicas destacadas (RN-01 a RN-05, timer con Date.now(),
  localStorage justificado, evaluación de sesión en servidor) y estado
  final del proyecto

El proyecto EquilibraStudy está terminado. Tu trabajo en este repositorio
concluye aquí.
```

---

> Laura Celedon — Doc: 1128201459
> Curso: Lógica y Programación — SIST0200
