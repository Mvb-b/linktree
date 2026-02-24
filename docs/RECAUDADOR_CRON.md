# 🤖 Agente Recaudador - Cron Job

Sistema automatizado para procesar pagos pendientes del LinkTree de MisraVB.

## 📋 Descripción

El agente recaudador escanea periódicamente los pagos con estado `pending` y los procesa automáticamente. Está diseñado para integrarse con múltiples proveedores de pago.

## 🔧 Configuración

### Variables de Entorno

```bash
# .env.local o variables de Vercel
CRON_SECRET=tu_secreto_super_seguro_aqui
```

> ⚠️ **IMPORTANTE**: El CRON_SECRET debe ser un string aleatorio seguro de al menos 32 caracteres.

### Generar CRON_SECRET

```bash
node -e "console.log(crypto.randomBytes(32).toString('hex'))"
# o
openssl rand -hex 32
```

## 🚀 Configuración de Cron

### Opción 1: Vercel (Recomendado)

El archivo `vercel.json` ya incluye la configuración:

```json
{
  "crons": [
    {
      "path": "/api/cron/recaudador",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Frecuencia**: Cada 6 horas (00:00, 06:00, 12:00, 18:00 UTC)

### Opción 2: Servidor Externo / VPS

Usar cron de Linux:

```bash
# Editar crontab
crontab -e

# Agregar línea para ejecutar cada 6 horas
0 */6 * * * curl -X POST "https://tu-dominio.com/api/cron/recaudador" -H "Authorization: Bearer tu_cron_secret"
```

### Opción 3: node-cron (Local/Desarrollo)

Instalar `node-cron` y crear un script de ejecución:

```bash
npm install node-cron
```

Crear `scripts/cron-local.ts`:

```typescript
import cron from 'node-cron';

// Ejecutar cada 6 horas
cron.schedule('0 */6 * * *', async () => {
  const response = await fetch('http://localhost:3000/api/cron/recaudador', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CRON_SECRET}`
    }
  });
  console.log('[CRON] Resultado:', await response.json());
});
```

## 📡 Uso del Endpoint

### Ejecutar Manualmente

```bash
# Producción
curl -X POST "https://misravb.vercel.app/api/cron/recaudador" \
  -H "Authorization: Bearer TU_CRON_SECRET"

# Desarrollo local
curl -X POST "http://localhost:3000/api/cron/recaudador" \
  -H "Authorization: Bearer dev-secret-123"

# Usando GET (también soportado)
curl "http://localhost:3000/api/cron/recaudador" \
  -H "Authorization: Bearer dev-secret-123"
```

### Respuesta Exitosa

```json
{
  "success": true,
  "message": "Agente recaudador ejecutado exitosamente",
  "result": {
    "processed": 5,
    "completed": 4,
    "failed": 1,
    "errors": ["Error procesando pago 123: Timeout"],
    "timestamp": "2025-02-24T23:30:00.000Z"
  },
  "summary": {
    "totalCompleted": 150.50,
    "totalPending": 25.00,
    "totalAmount": 175.50
  },
  "executionTimeMs": 1245
}
```

### Respuesta de Error

```json
{
  "success": false,
  "error": "Error ejecutando agente recaudador",
  "details": "Database connection failed",
  "result": {
    "processed": 0,
    "completed": 0,
    "failed": 0,
    "errors": [],
    "timestamp": "2025-02-24T23:30:00.000Z"
  },
  "executionTimeMs": 50
}
```

## 🔌 Extensiones Futuras

Para integrar con un proveedor de pagos real, modificar la función `processPayment` en `app/api/cron/recaudador/route.ts`:

### Ejemplo: MercadoPago

```typescript
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

async function processPayment(payment) {
  const mpPayment = await new Payment(client).get({
    id: payment.paymentRecorderId
  });
  
  if (mpPayment.status === 'approved') {
    return { success: true };
  }
  
  return { success: false, error: mpPayment.status_detail };
}
```

### Ejemplo: Stripe

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function processPayment(payment) {
  const intent = await stripe.paymentIntents.retrieve(
    payment.paymentRecorderId
  );
  
  if (intent.status === 'succeeded') {
    return { success: true };
  }
  
  return { success: false, error: intent.status };
}
```

## 📝 Logs

Los logs se muestran en la consola del servidor con el prefijo `[RECAUDADOR]`:

```
[RECAUDADOR] Iniciando ejecución del agente recaudador...
[RECAUDADOR] Encontrados 5 pagos pendientes
[RECAUDADOR] Procesando pago 10 - $50.00 - Donación Twitch
[RECAUDADOR] Pago 10 completado exitosamente
[RECAUDADOR] Ejecución completada: { processed: 5, completed: 4, failed: 1, executionTimeMs: 1245 }
```

## 🧪 Testing

### Test Local

```bash
# 1. Setear variables
export CRON_SECRET=dev-secret-123

# 2. Iniciar servidor
npm run dev

# 3. En otra terminal, ejecutar
curl -X POST "http://localhost:3000/api/cron/recaudador" \
  -H "Authorization: Bearer dev-secret-123"
```

### Test con Script Node.js

```bash
# Ejecutar el script de prueba
node scripts/test-recaudador.js
```

## 🔒 Seguridad

1. **Nunca commits el CRON_SECRET** - usar `.env.local` y variables de entorno
2. **Rotar secretos periódicamente** - cada 90 días recomendado
3. **Usar HTTPS en producción** - el token viaja en headers
4. **Monitorear logs** - revisar intentos de acceso no autorizado

## 📊 Monitoreo

Para monitorear la ejecución del cron:

- **Vercel**: Dashboard → Logs → Filtrar por `/api/cron/recaudador`
- **Servidor**: `tail -f /var/log/cron.log` o usar PM2 logs
- **Notificaciones**: Implementar webhook de notificación en el endpoint

## 🆘 Troubleshooting

### Error 401 Unauthorized
- Verificar CRON_SECRET configurado
- Verificar header Authorization: Bearer <token>

### Error 500 Database
- Verificar permisos de escritura en `data/` directory
- Verificar SQLite file no está bloqueado

### Pagos no procesados
- Verificar que `paymentRecorderId` esté asignado correctamente
- Revisar logs de integración con proveedor de pagos
- Verificar que pagos tengan status `pending`

## 📅 Frecuencias Recomendadas

| Frecuencia | Cron Expression | Caso de Uso |
|------------|-----------------|-------------|
| Cada hora | `0 * * * *` | Alto volumen de pagos |
| Cada 6 horas | `0 */6 * * *` | **Recomendado** - Balance general |
| Diario | `0 0 * * *` | Bajo volumen |
| Semanal | `0 0 * * 0` | Reportes y reconciliación |

---

*Documentación generada automáticamente para el proyecto MisraVB LinkTree*
