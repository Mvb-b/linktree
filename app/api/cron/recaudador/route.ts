import { NextRequest, NextResponse } from 'next/server';
import { getAllPayments, updatePayment, getPaymentsSummary } from '@/lib/db';

/**
 * Agente Recaudador - Cron Job
 * 
 * Procesa pagos pendientes y actualiza su estado.
 * Se ejecuta automáticamente mediante cron (ej: cada hora).
 * Requiere CRON_SECRET para autorización.
 */

interface RecaudadorResult {
  processed: number;
  completed: number;
  failed: number;
  errors: string[];
  timestamp: string;
}

/**
 * Valida el token de autorización del cron
 */
function validateCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;
  
  if (!expectedSecret) {
    console.error('[RECAUDADOR] CRON_SECRET no configurado');
    return false;
  }
  
  const token = authHeader?.replace('Bearer ', '').trim();
  return token === expectedSecret;
}

/**
 * Procesa un pago pendiente individual
 * Aquí se puede integrar con APIs de pago externas (MercadoPago, Stripe, etc.)
 */
async function processPayment(payment: {
  id: number;
  paymentRecorderId: string;
  amount: number;
  status: string;
  description: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Placeholder para lógica de recaudación real
    // Ejemplo de integraciones posibles:
    // - Verificar estado en MercadoPago
    // - Verificar estado en Stripe
    // - Verificar transferencias bancarias
    // - Consultar API de procesador de pagos
    
    // Simulación: validar que el monto sea positivo y tenga ID válido
    if (!payment.paymentRecorderId || payment.amount <= 0) {
      return { 
        success: false, 
        error: `Pago ${payment.id}: Datos inválidos` 
      };
    }
    
    // Aquí iría la lógica real de verificación con proveedor de pagos
    // Por ahora, marcamos como completado simulando éxito
    // En producción, integrar con:
    // - const mpStatus = await mercadoPago.getPayment(payment.paymentRecorderId);
    // - const stripeStatus = await stripe.paymentIntents.retrieve(payment.paymentRecorderId);
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: `Error procesando pago ${payment.id}: ${error instanceof Error ? error.message : 'Unknown'}` 
    };
  }
}

/**
 * GET /api/cron/recaudador
 * Ejecuta el agente recaudador manual (trigger directo)
 */
export async function GET(request: NextRequest) {
  return handleRecaudadorExecution(request);
}

/**
 * POST /api/cron/recaudador
 * Ejecuta el agente recaudador (recomendado para cron jobs)
 */
export async function POST(request: NextRequest) {
  return handleRecaudadorExecution(request);
}

/**
 * Lógica principal del agente recaudador
 */
async function handleRecaudadorExecution(request: NextRequest) {
  const startTime = Date.now();
  
  // Validar autorización
  if (!validateCronSecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid or missing CRON_SECRET' },
      { status: 401 }
    );
  }

  console.log('[RECAUDADOR] Iniciando ejecución del agente recaudador...');

  const result: RecaudadorResult = {
    processed: 0,
    completed: 0,
    failed: 0,
    errors: [],
    timestamp: new Date().toISOString(),
  };

  try {
    // Obtener pagos pendientes
    const pendingPayments = getAllPayments({ status: 'pending' });
    
    console.log(`[RECAUDADOR] Encontrados ${pendingPayments.length} pagos pendientes`);

    if (pendingPayments.length === 0) {
      console.log('[RECAUDADOR] No hay pagos pendientes para procesar');
      return NextResponse.json({
        success: true,
        message: 'No hay pagos pendientes',
        result,
        executionTimeMs: Date.now() - startTime,
      });
    }

    // Procesar cada pago pendiente
    for (const payment of pendingPayments) {
      result.processed++;
      
      console.log(`[RECAUDADOR] Procesando pago ${payment.id} - $${payment.amount} - ${payment.description}`);
      
      const processResult = await processPayment(payment);
      
      if (processResult.success) {
        // Actualizar estado a completado
        updatePayment(payment.id, { status: 'completed' });
        result.completed++;
        console.log(`[RECAUDADOR] Pago ${payment.id} completado exitosamente`);
      } else {
        // Mantener como pendiente o marcar como fallido según lógica de negocio
        // Por ahora, mantenemos pending para reintentos
        result.failed++;
        if (processResult.error) {
          result.errors.push(processResult.error);
        }
        console.error(`[RECAUDADOR] Error en pago ${payment.id}: ${processResult.error}`);
      }
    }

    // Obtener resumen actualizado
    const summary = getPaymentsSummary();
    
    const executionTime = Date.now() - startTime;
    
    console.log('[RECAUDADOR] Ejecución completada:', {
      processed: result.processed,
      completed: result.completed,
      failed: result.failed,
      executionTimeMs: executionTime,
    });

    return NextResponse.json({
      success: true,
      message: 'Agente recaudador ejecutado exitosamente',
      result,
      summary: {
        totalCompleted: summary.totalCompleted,
        totalPending: summary.totalPending,
        totalAmount: summary.totalAmount,
      },
      executionTimeMs: executionTime,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[RECAUDADOR] Error fatal:', errorMessage);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error ejecutando agente recaudador',
        details: errorMessage,
        result,
        executionTimeMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

/**
 * Configuración de Edge Runtime para cron jobs de Vercel
 * Si se usa Vercel, esta configuración permite ejecución periódica
 */
export const runtime = 'nodejs';
export const preferredRegion = 'scl1'; // Santiago, Chile (cercano a Misra)
export const dynamic = 'force-dynamic';
