# 📊 Analytics - LinkTree de Misra

Sistema de analytics simple y privado para trackear clicks en los enlaces del LinkTree.

## 🏗️ Arquitectura

### Stack
- **Database**: SQLite (via `better-sqlite3`)
- **API Routes**: Next.js 14 App Router
- **Dashboard**: `/admin/analytics` con React + Tailwind

### Tablas

```sql
clicks
├── id (INTEGER PRIMARY KEY)
├── platform (TEXT)          -- ex: twitch, youtube, newsletter
├── url (TEXT)               -- URL destino
├── clicked_at (DATETIME)    -- timestamp
├── user_agent (TEXT)        -- navegador
├── ip_hash (TEXT)           -- hash de IP (anonimizado)
└── referrer (TEXT)          -- página origen

daily_stats
├── id (INTEGER PRIMARY KEY)
├── date (TEXT UNIQUE)       -- YYYY-MM-DD
├── total_clicks (INTEGER)
└── updated_at (DATETIME)
```

## 📡 Endpoints API

### POST /api/analytics/track
Registra un click.

```json
{
  "platform": "twitch",
  "url": "https://twitch.tv/streamerhub"
}
```

**Headers**
- `Content-Type: application/json`

**Response**
```json
{
  "success": true,
  "clickId": 1,
  "message": "Click tracked successfully"
}
```

### GET /api/analytics/stats
Obtiene estadísticas agregadas.

**Response**
```json
{
  "success": true,
  "data": {
    "totalClicks": 150,
    "clicksLast24h": 12,
    "clicksByPlatform": [
      { "platform": "twitch", "count": 80 },
      { "platform": "instagram", "count": 45 }
    ],
    "trend": [
      { "date": "2025-03-20", "count": 25 },
      { "date": "2025-03-21", "count": 18 }
    ],
    "topLinks": [
      { "platform": "twitch", "url": "https://twitch.tv/streamerhub", "count": 80 }
    ]
  }
}
```

## 📱 Uso en Componentes

### Track clicks en botones

```tsx
import { useAnalytics } from '../hooks/useAnalytics'

function MyButton() {
  const { trackClick } = useAnalytics()
  
  const handleClick = () => {
    trackClick('facebook', 'https://facebook.com/streamerhub')
    window.open('https://facebook.com/streamerhub', '_blank')
  }
  
  return <button onClick={handleClick}>Ver Facebook</button>
}
```

### Track eventos personalizados

```tsx
const { trackEvent } = useAnalytics()

trackEvent('newsletter', { action: 'subscribe' })
```

## 🔒 Privacidad

- ✅ **NO** se almacenan IPs completas (solo hash SHA256 truncado)
- ✅ **NO** se usan cookies de terceros
- ✅ **NO** se comparten datos con servicios externos
- ✅ Datos almacenados localmente en SQLite

## 📈 Dashboard

Accede al dashboard en: `https://dev-linktree.streamerhub.com/admin/analytics`

### Features
- Total de clicks y últimas 24h
- Clicks por plataforma
- Tendencia diaria (gráfico de barras)
- Top links más clickeados
- Auto-refresh cada 30 segundos
- Filter por período (7/14/30 días)

## 🗄️ Base de Datos

### Ubicación
```
/data/workspace/projects/streamerhub-linktree/data/analytics.db
```

### Backup
La base de datos SQLite es un archivo único que puede copiarse fácilmente:
```bash
cp data/analytics.db data/analytics.backup.$(date +%Y%m%d).db
```

### Consultas SQL Útiles

```sql
-- Total clicks por mes
SELECT strftime('%Y-%m', clicked_at) as month, COUNT(*) as clicks
FROM clicks
GROUP BY month
ORDER BY month DESC;

-- Plataforma más popular
SELECT platform, COUNT(*) as clicks
FROM clicks
GROUP BY platform
ORDER BY clicks DESC;

-- Clicks últimas 24h
SELECT COUNT(*) FROM clicks
WHERE clicked_at >= datetime('now', '-24 hours');
```

## 🔧 Troubleshooting

### No se registran clicks
1. Verificar que la API responde: `curl -X POST /api/analytics/track`
2. Revisar console del navegador por errores
3. Verificar permisos del directorio `data/`

### Database locked
```bash
# Eliminar shm/wal files
rm data/analytics.db-shm data/analytics.db-wal
```

### Resetear estadísticas
```bash
# Backup primero
cp data/analytics.db data/analytics.backup.db

# Reset
echo "DELETE FROM clicks; DELETE FROM daily_stats;" | sqlite3 data/analytics.db
```

## 📝 TODO

- [ ] Exportar datos a CSV/JSON
- [ ] Filtrar por fecha personalizada
- [ ] Comparar períodos
- [ ] Alertas de actividad anómala
