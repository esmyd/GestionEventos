"""
Script para verificar y eliminar triggers de pagos que llaman a procedimientos inexistentes
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configurar encoding UTF-8 para Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from modelos.base_datos import BaseDatos

def verificar_y_eliminar_triggers():
    """Verifica y elimina triggers problemáticos"""
    bd = BaseDatos()
    
    try:
        print("Verificando triggers en tabla 'pagos'...")
        
        # Obtener todos los triggers de la tabla pagos
        consulta = "SHOW TRIGGERS WHERE `Table` = 'pagos'"
        triggers = bd.obtener_todos(consulta)
        
        if triggers:
            print(f"\nSe encontraron {len(triggers)} trigger(s):")
            for trigger in triggers:
                nombre = trigger.get('Trigger', 'N/A')
                evento = trigger.get('Event', 'N/A')
                print(f"  - {nombre} ({evento})")
            
            # Eliminar triggers que llaman a crear_notificacion_inmediata
            triggers_a_eliminar = [
                'trigger_notificar_abono',
                'trigger_notificar_pago_completo'
            ]
            
            print("\nEliminando triggers que llaman a procedimientos inexistentes...")
            for trigger_name in triggers_a_eliminar:
                consulta = f"DROP TRIGGER IF EXISTS {trigger_name}"
                if bd.ejecutar_consulta(consulta):
                    print(f"  [OK] Trigger '{trigger_name}' eliminado")
                else:
                    print(f"  [INFO] Trigger '{trigger_name}' no existe o ya fue eliminado")
        else:
            print("\n[OK] No se encontraron triggers en la tabla 'pagos'")
        
        print("\n[OK] Proceso completado")
        print("\nNOTA: Las notificaciones ahora se crean desde Python en pago_modelo.py")
        print("      cuando se registra un pago. Esto es más flexible y fácil de mantener.")
        
    except Exception as e:
        print(f"[ERROR] {e}")
        import traceback
        traceback.print_exc()
    finally:
        bd.desconectar()

if __name__ == "__main__":
    verificar_y_eliminar_triggers()


