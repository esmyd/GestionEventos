"""
Procesa notificaciones programadas y pendientes (V2)
Ejecutar con un scheduler (Task Scheduler/Cron)
"""
import argparse
import os
import sys
from datetime import datetime

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from integraciones.sistema_notificaciones_v2 import SistemaNotificacionesV2
from modelos.notificacion_modelo_v2 import NotificacionModeloV2
from integraciones.sistema_notificaciones import SistemaNotificaciones
from modelos.evento_modelo import EventoModelo


def main():
    parser = argparse.ArgumentParser(description="Procesar notificaciones pendientes")
    parser.add_argument("--limite", type=int, default=100, help="Maximo de notificaciones a procesar")
    parser.add_argument("--debug", action="store_true", help="Mostrar detalle de eventos programados")
    args = parser.parse_args()

    print(f"[{datetime.now()}] Iniciando procesamiento de notificaciones...")
    modelo = NotificacionModeloV2()
    sistema_v2 = SistemaNotificacionesV2()

    resultado = modelo.generar_notificaciones_programadas()
    if resultado is None:
        # Fallback a procesamiento directo si no existe procedimiento en DB
        print(f"[{datetime.now()}] Procedimiento generar_notificaciones_programadas no disponible. Usando fallback.")
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
            print(f"[{datetime.now()}] Error al actualizar estados por fecha: {e}")
        print(f"[{datetime.now()}] Fallback completado. Total enviadas: {total}")
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
        print(f"[{datetime.now()}] Error al actualizar estados por fecha: {e}")
    print(f"[{datetime.now()}] Procesamiento finalizado. Enviadas: {enviados}, Errores: {errores}")


if __name__ == "__main__":
    main()
