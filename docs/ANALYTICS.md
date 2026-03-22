# 📊 Analytics LinkTree - StreamerHub

Sistema de analytics privado y sin cookies invasivas para trackear clicks en el LinkTree.

## 🏗️ Arquitectura

### Base de datos: SQLite (better-sqlite3)
- Tabla `clicks`: Registro de cada click
- Tabla `daily_stats`: Estadísticas agregadas por día
- Privacidad: Solo se almacena hash SHA256 del IP (16 chars), no la IP completa

### Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/analytics/track` | Registrar un click (SQLite) |
| GET | `/api/analytics/stats` | Obtener estadísticas totales |
| POST | `/api/analytics/click` | Legacy: registrar click en JSON |
| GET | `/api/analytics/click` | Legacy: leer clicks JSON |

## 📈 Dashboard

Acceso: `/admin/analytics`

Credenciales: Las mismas del panel admin

### Métricas disponibles:
- Total de clicks
- Clicks últimas 24h
- Clicks por plataforma (Twitch, TikTok, Instagram, etc.)
- Tendencia por día (últimos 7 días)
- Links más clickeados (top 5)

## 🔗 Tracking de Links

### Links sociales (automático)
Todos los botones de redes sociales ya trackean automáticamente via `LinkButton.tsx` usando el hook `useAnalytics`.

### Eventos trackeados:

| Categoría | Evento | Descripción |
|-----------|--------|-------------|
| Social | `twitch` | Click en botón Twitch |
| Social | `tiktok` | Click en botón TikTok |
| Social | `instagram` | Click en botón Instagram |
| Social | `twitter` | Click en botón Twitter/X |
| Social | `youtube` | Click en botón YouTube |
| Social | `facebook` | Click en botón Facebook |
| Newsletter | `newsletter_modal_opened` | Usuario abrió modal |
| Newsletter | `newsletter_subscribed` | Usuario se suscribió |
| Newsletter | `newsletter_modal_closed` | Usuario cerró modal |

## 🔒 Privacidad

- ❌ No cookies de seguimiento
- ❌ No IPs completas almacenadas
- ✅ Solo hash SHA256 del IP (16 caracteres)
- ✅ No datos personales vinculados a clics
- ✅ Self-hosted (sin terceros)

## 🛠️ Hook useAnalytics

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const { trackClick, trackEvent } = useAnalytics();

  // Tracking simple de click en link
  const handleClick = () => {
    trackClick('miPlataforma', 'https://ejemplo.com');
  };

  // Tracking de evento personalizado
  const handleCustomEvent = () => {
    trackEvent('mi_evento', { metadata: 'valor' });
  };
}
```

## 🗃️ Estructura BD

```sql
CREATE TABLE clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  clicked_at TEXT DEFAULT (datetime('now')),
  user_agent TEXT,
  ip_hash TEXT,
  referrer TEXT
);

CREATE TABLE daily_stats (
  date TEXT UNIQUE PRIMARY KEY,
  total_clicks INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
);
```

## 🔍 Consultas útiles

Ver clicks por hora:
```sql
SELECT strftime('%H', clicked_at) as hour, COUNT(*) as count
FROM clicks
WHERE date(clicked_at) = date('now')
GROUP BY hour ORDER BY hour;
```

Ver top plataformas:
```sql
SELECT platform, COUNT(*) as clicks
FROM clicks
GROUP BY platform ORDER BY clicks DESC;
```

## 📱 Acceso móvil

El dashboard es responsive. Accede desde tu celular a:
`https://dev-linktree.streamerhub.com/admin/analytics`

---

Última actualización: 2026-03-22
Implementado por: Code (OpenClaw)
