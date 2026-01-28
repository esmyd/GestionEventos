"""
Procesa notificaciones programadas y pendientes (V2)
También procesa reintentos de mensajes WhatsApp fallidos
Ejecutar con un scheduler (Task Scheduler/Cron)
"""
import argparse
import os
import sys
from datetime import datetime

def get_timestamp():
    """Retorna timestamp formateado sin microsegundos"""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from integraciones.sistema_notificaciones_v2 import SistemaNotificacionesV2
from modelos.notificacion_modelo_v2 import NotificacionModeloV2
from integraciones.sistema_notificaciones import SistemaNotificaciones
from modelos.evento_modelo import EventoModelo
from utilidades.reintentar_mensajes_whatsapp import ServicioReintentosWhatsApp


def procesar_reintentos_whatsapp(limite=50, debug=False):
    """Procesa reintentos de mensajes WhatsApp fallidos"""
    try:
        servicio = ServicioReintentosWhatsApp()
        resultado = servicio.procesar_reintentos(limite=limite)
        
        if resultado['total'] > 0:
            print(f"[{get_timestamp()}] Reintentos WhatsApp: {resultado['exitosos']} exitosos, "
                  f"{resultado['fallidos']} fallidos, {resultado['no_reintentables']} no reintentables")
        elif debug:
            print(f"[{get_timestamp()}] No hay mensajes WhatsApp pendientes de reintento")
        
        return resultado
    except Exception as e:
        print(f"[{get_timestamp()}] Error procesando reintentos WhatsApp: {e}")
        return {'total': 0, 'exitosos': 0, 'fallidos': 0, 'no_reintentables': 0}


def main():
    parser = argparse.ArgumentParser(description="Procesar notificaciones pendientes")
    parser.add_argument("--limite", type=int, default=100, help="Maximo de notificaciones a procesar")
    parser.add_argument("--debug", action="store_true", help="Mostrar detalle de eventos programados")
    parser.add_argument("--solo-reintentos", action="store_true", help="Solo procesar reintentos de WhatsApp")
    parser.add_argument("--sin-reintentos", action="store_true", help="No procesar reintentos de WhatsApp")
    args = parser.parse_args()

    print(f"[{get_timestamp()}] Iniciando procesamiento de notificaciones...")
    
    # Si solo quiere procesar reintentos
    if args.solo_reintentos:
        resultado_reintentos = procesar_reintentos_whatsapp(args.limite, args.debug)
        print(f"[{get_timestamp()}] Procesamiento de reintentos finalizado.")
        return
    
    modelo = NotificacionModeloV2()
    sistema_v2 = SistemaNotificacionesV2()

    resultado = modelo.generar_notificaciones_programadas()
    if resultado is None:
        # Fallback a procesamiento directo si no existe procedimiento en DB
        print(f"[{get_timestamp()}] Procedimiento generar_notificaciones_programadas no disponible. Usando fallback.")
        sistema = SistemaNotificaciones()
        if args.debug:
            try:
                from modelos.notificacion_modelo import NotificacionModelo
                notif_modelo = NotificacionModelo()
                for tipo in ("recordatorio_7_dias", "recordatorio_1_dia", "solicitud_calificacion"):
                    eventos = notif_modelo.obtener_eventos_para_notificar(tipo) or []
                    print(f"[DEBUG] {tipo}: {len(eventos)} eventos candidatos")
                    for evento in eventos:
                        print(
                            f"  - Evento {evento.get('id_evento')} | fecha={evento.get('fecha_evento')} | "
                            f"estado={evento.get('estado')}"
                        )
            except Exception as e:
                print(f"[DEBUG] Error listando eventos candidatos: {e}")
        total = sistema.procesar_notificaciones_programadas()
        try:
            EventoModelo().actualizar_eventos_finalizados()
        except Exception as e:
            print(f"[{get_timestamp()}] Error al actualizar estados por fecha: {e}")
        print(f"[{get_timestamp()}] Fallback completado. Total enviadas: {total}")
        
        # Procesar reintentos de WhatsApp (a menos que se haya desactivado)
        if not args.sin_reintentos:
            print(f"[{get_timestamp()}] Procesando reintentos de WhatsApp...")
            procesar_reintentos_whatsapp(args.limite, args.debug)
        
        print(f"[{get_timestamp()}] Procesamiento completo finalizado.")
        return

    if args.debug:
        try:
            notificaciones_pendientes = modelo.obtener_notificaciones_pendientes(args.limite) or []
            print(f"[DEBUG] Notificaciones pendientes: {len(notificaciones_pendientes)}")
            for notif in notificaciones_pendientes:
                print(
                    f"  - #{notif.get('id')} | evento={notif.get('evento_id')} | tipo={notif.get('tipo_notificacion')} | "
                    f"fecha_programada={notif.get('fecha_programada')}"
                )
        except Exception as e:
            print(f"[DEBUG] Error listando pendientes: {e}")
    enviados, errores = sistema_v2.procesar_notificaciones_pendientes(limite=args.limite)
    try:
        EventoModelo().actualizar_eventos_finalizados()
    except Exception as e:
        print(f"[{get_timestamp()}] Error al actualizar estados por fecha: {e}")
    print(f"[{get_timestamp()}] Notificaciones procesadas. Enviadas: {enviados}, Errores: {errores}")
    
    # Procesar reintentos de WhatsApp (a menos que se haya desactivado)
    if not args.sin_reintentos:
        print(f"[{get_timestamp()}] Procesando reintentos de WhatsApp...")
        resultado_reintentos = procesar_reintentos_whatsapp(args.limite, args.debug)
    
    print(f"[{get_timestamp()}] Procesamiento completo finalizado.")


if __name__ == "__main__":
    main()
