"""
Script para reintentar mensajes WhatsApp fallidos
Similar a cómo WhatsApp guarda mensajes pendientes y los reenvía cuando hay señal
"""
import sys
import os
from datetime import datetime, timedelta

# Agregar el directorio raíz al path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from modelos.whatsapp_chat_modelo import WhatsAppChatModelo
from modelos.base_datos import BaseDatos
from integraciones.whatsapp import IntegracionWhatsApp
from utilidades.logger import obtener_logger
import json
import argparse

logger = obtener_logger()


class ServicioReintentosWhatsApp:
    """Servicio para reintentar mensajes WhatsApp fallidos"""
    
    def __init__(self):
        self.chat_modelo = WhatsAppChatModelo()
        self.base_datos = BaseDatos()
        self.whatsapp = IntegracionWhatsApp()
        self._asegurar_columnas_reintento()
    
    def _asegurar_columnas_reintento(self):
        """Asegura que las columnas de reintento existan"""
        try:
            consulta = """
            SELECT COUNT(*) as total
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'whatsapp_mensajes'
              AND COLUMN_NAME = 'intentos_reintento'
            """
            existe = self.base_datos.obtener_uno(consulta) or {}
            if int(existe.get("total") or 0) == 0:
                self.base_datos.ejecutar_consulta(
                    "ALTER TABLE whatsapp_mensajes ADD COLUMN intentos_reintento INT DEFAULT 0"
                )
                self.base_datos.ejecutar_consulta(
                    "ALTER TABLE whatsapp_mensajes ADD COLUMN fecha_ultimo_reintento TIMESTAMP NULL"
                )
                self.base_datos.ejecutar_consulta(
                    "ALTER TABLE whatsapp_mensajes ADD COLUMN pendiente_reintento TINYINT(1) DEFAULT 0"
                )
                self.base_datos.ejecutar_consulta(
                    "ALTER TABLE whatsapp_mensajes ADD COLUMN max_intentos_reintento INT DEFAULT 3"
                )
                self.base_datos.ejecutar_consulta(
                    "ALTER TABLE whatsapp_mensajes ADD INDEX idx_pendiente_reintento (pendiente_reintento, estado, fecha_creacion)"
                )
        except Exception as e:
            logger.warning(f"Error al asegurar columnas de reintento: {e}")
    
    def _es_error_no_reintentable(self, raw_json):
        """Determina si un error no debe reintentarse"""
        if not raw_json:
            return False
        
        try:
            if isinstance(raw_json, str):
                error_data = json.loads(raw_json)
            else:
                error_data = raw_json
            
            # Error de ventana 24h (131047) - no reintentar
            if isinstance(error_data, dict):
                errors = error_data.get("errors", [])
                if isinstance(errors, list):
                    for error in errors:
                        if str(error.get("code")) == "131047":
                            return True
                # También verificar en el mensaje directamente
                if "131047" in str(error_data):
                    return True
            
            # Verificar en string
            if "131047" in str(raw_json):
                return True
        except Exception:
            pass
        
        return False
    
    def obtener_mensajes_pendientes(self, limite=50):
        """Obtiene mensajes pendientes de reintento"""
        consulta = """
        SELECT 
            wm.id,
            wm.conversacion_id,
            wm.mensaje,
            wm.wa_message_id,
            wm.origen,
            wm.estado,
            wm.raw_json,
            wm.intentos_reintento,
            wm.max_intentos_reintento,
            wm.fecha_creacion,
            wc.telefono,
            wc.cliente_id
        FROM whatsapp_mensajes wm
        JOIN whatsapp_conversaciones wc ON wm.conversacion_id = wc.id
        WHERE wm.pendiente_reintento = 1
          AND wm.estado = 'fallido'
          AND wm.direccion = 'out'
          AND wm.intentos_reintento < COALESCE(wm.max_intentos_reintento, 3)
          AND (
            wm.fecha_ultimo_reintento IS NULL
            OR wm.fecha_ultimo_reintento < DATE_SUB(NOW(), INTERVAL 5 MINUTE)
          )
        ORDER BY wm.fecha_creacion ASC
        LIMIT %s
        """
        return self.base_datos.obtener_todos(consulta, (limite,))
    
    def reintentar_mensaje(self, mensaje_data):
        """Reintenta enviar un mensaje fallido"""
        mensaje_id = mensaje_data.get("id")
        telefono = mensaje_data.get("telefono")
        mensaje_texto = mensaje_data.get("mensaje")
        conversacion_id = mensaje_data.get("conversacion_id")
        origen = mensaje_data.get("origen", "sistema")
        raw_json = mensaje_data.get("raw_json")
        intentos_actuales = int(mensaje_data.get("intentos_reintento") or 0)
        max_intentos = int(mensaje_data.get("max_intentos_reintento") or 3)
        
        # Verificar si el error es no reintentable
        if self._es_error_no_reintentable(raw_json):
            logger.info(f"Mensaje {mensaje_id} tiene error no reintentable, marcando como no pendiente")
            self._marcar_no_pendiente(mensaje_id)
            return False, "Error no reintentable (ventana 24h)"
        
        # Verificar límite de intentos
        if intentos_actuales >= max_intentos:
            logger.warning(f"Mensaje {mensaje_id} alcanzó el límite de reintentos ({max_intentos})")
            self._marcar_no_pendiente(mensaje_id)
            return False, f"Límite de reintentos alcanzado ({max_intentos})"
        
        try:
            # Intentar reenviar el mensaje
            ok, wa_message_id, error = self.whatsapp.enviar_mensaje_con_error(telefono, mensaje_texto)
            
            # Actualizar intentos
            nuevo_intento = intentos_actuales + 1
            consulta = """
            UPDATE whatsapp_mensajes
            SET intentos_reintento = %s,
                fecha_ultimo_reintento = NOW()
            WHERE id = %s
            """
            self.base_datos.ejecutar_consulta(consulta, (nuevo_intento, mensaje_id))
            
            if ok:
                # Mensaje enviado exitosamente
                consulta = """
                UPDATE whatsapp_mensajes
                SET estado = 'sent',
                    wa_message_id = %s,
                    pendiente_reintento = 0,
                    fecha_ultimo_reintento = NOW()
                WHERE id = %s
                """
                self.base_datos.ejecutar_consulta(consulta, (wa_message_id, mensaje_id))
                
                logger.info(f"Mensaje {mensaje_id} reenviado exitosamente después de {nuevo_intento} intentos")
                return True, None
            else:
                # El mensaje sigue fallando
                consulta = """
                UPDATE whatsapp_mensajes
                SET raw_json = %s,
                    fecha_ultimo_reintento = NOW()
                WHERE id = %s
                """
                error_text = json.dumps(error, ensure_ascii=False) if isinstance(error, dict) else str(error)
                self.base_datos.ejecutar_consulta(consulta, (error_text, mensaje_id))
                
                # Si alcanzó el límite, marcar como no pendiente
                if nuevo_intento >= max_intentos:
                    self._marcar_no_pendiente(mensaje_id)
                
                logger.warning(f"Mensaje {mensaje_id} falló en reintento {nuevo_intento}: {error}")
                return False, error
                
        except Exception as e:
            logger.error(f"Error al reintentar mensaje {mensaje_id}: {e}")
            # Incrementar intentos incluso si hay error
            nuevo_intento = intentos_actuales + 1
            consulta = """
            UPDATE whatsapp_mensajes
            SET intentos_reintento = %s,
                fecha_ultimo_reintento = NOW()
            WHERE id = %s
            """
            self.base_datos.ejecutar_consulta(consulta, (nuevo_intento, mensaje_id))
            return False, str(e)
    
    def _marcar_no_pendiente(self, mensaje_id):
        """Marca un mensaje como no pendiente de reintento"""
        consulta = """
        UPDATE whatsapp_mensajes
        SET pendiente_reintento = 0
        WHERE id = %s
        """
        self.base_datos.ejecutar_consulta(consulta, (mensaje_id,))
    
    def procesar_reintentos(self, limite=50):
        """Procesa todos los mensajes pendientes de reintento"""
        mensajes = self.obtener_mensajes_pendientes(limite)
        
        if not mensajes:
            logger.info("No hay mensajes pendientes de reintento")
            return {
                'total': 0,
                'exitosos': 0,
                'fallidos': 0,
                'no_reintentables': 0
            }
        
        logger.info(f"Procesando {len(mensajes)} mensajes pendientes de reintento")
        
        exitosos = 0
        fallidos = 0
        no_reintentables = 0
        
        for mensaje in mensajes:
            ok, error = self.reintentar_mensaje(mensaje)
            if ok:
                exitosos += 1
            elif error and "no reintentable" in str(error).lower():
                no_reintentables += 1
            else:
                fallidos += 1
        
        resultado = {
            'total': len(mensajes),
            'exitosos': exitosos,
            'fallidos': fallidos,
            'no_reintentables': no_reintentables
        }
        
        logger.info(f"Reintentos procesados: {resultado}")
        return resultado


def main():
    """Función principal para ejecutar el script"""
    parser = argparse.ArgumentParser(description='Reintentar mensajes WhatsApp fallidos')
    parser.add_argument('--limite', type=int, default=50, help='Límite de mensajes a procesar')
    parser.add_argument('--debug', action='store_true', help='Modo debug')
    
    args = parser.parse_args()
    
    if args.debug:
        logger.setLevel('DEBUG')
    
    servicio = ServicioReintentosWhatsApp()
    resultado = servicio.procesar_reintentos(limite=args.limite)
    
    print(f"\n{'='*60}")
    print(f"Reintentos de mensajes WhatsApp")
    print(f"{'='*60}")
    print(f"Total procesados: {resultado['total']}")
    print(f"Exitosos: {resultado['exitosos']}")
    print(f"Fallidos: {resultado['fallidos']}")
    print(f"No reintentables: {resultado['no_reintentables']}")
    print(f"{'='*60}\n")
    
    return resultado


if __name__ == "__main__":
    main()
