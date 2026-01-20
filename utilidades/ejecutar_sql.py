"""
Script de utilidad para ejecutar el script SQL de configuración
"""
import mysql.connector
import os
import sys

# Agregar el directorio raíz al path para importar config
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import DB_CONFIG


def ejecutar_script_sql(archivo_sql):
    """Ejecuta un script SQL desde un archivo"""
    try:
        # Leer el archivo SQL
        with open(archivo_sql, 'r', encoding='utf-8') as f:
            script_sql = f.read()
        
        # Conectar a MySQL
        conexion = mysql.connector.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        
        # Ejecutar el script completo usando multi_statements
        ejecutados = 0
        errores = []
        
        # Dividir por punto y coma, pero mantener estructura
        comandos = []
        comando_actual = ""
        
        for linea in script_sql.split('\n'):
            # Ignorar líneas de comentarios
            linea_limpia = linea.strip()
            if linea_limpia.startswith('--') or linea_limpia.startswith('/*') or not linea_limpia:
                continue
            
            # Remover comentarios al final de línea
            if '--' in linea:
                linea = linea.split('--')[0]
            
            comando_actual += linea + "\n"
            
            # Si la línea termina con ;, es el final del comando
            if linea.rstrip().endswith(';'):
                comando = comando_actual.strip()
                if comando and len(comando) > 1:  # Más que solo el ;
                    comandos.append(comando)
                comando_actual = ""
        
        # Ejecutar cada comando
        for comando in comandos:
            if comando:
                try:
                    cursor.execute(comando)
                    ejecutados += 1
                except mysql.connector.Error as e:
                    # Algunos errores son esperados (como "table already exists", "database exists")
                    error_msg = str(e).lower()
                    if any(x in error_msg for x in ["already exists", "duplicate", "database exists"]):
                        # Ignorar estos errores comunes
                        pass
                    else:
                        errores.append(f"Error: {str(e)[:100]}")
                        print(f"[INFO] Comando con advertencia: {comando[:50]}...")
        
        # Confirmar cambios
        conexion.commit()
        
        print(f"\n[OK] Script ejecutado exitosamente")
        print(f"  Comandos ejecutados: {ejecutados}")
        
        if errores:
            print(f"\n[ADVERTENCIA]")
            for error in errores:
                print(f"  - {error}")
        
        cursor.close()
        conexion.close()
        
        return True
        
    except FileNotFoundError:
        print(f"[ERROR] No se encontro el archivo {archivo_sql}")
        return False
    except mysql.connector.Error as e:
        print(f"[ERROR] Error de MySQL: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] Error inesperado: {e}")
        return False


if __name__ == "__main__":
    print("=== Ejecutar Script SQL de Configuración ===\n")
    
    # Buscar el archivo database_setup.sql
    script_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database_setup.sql')
    
    if not os.path.exists(script_path):
        print(f"[ERROR] No se encontro el archivo: {script_path}")
        print("  Asegurate de que database_setup.sql este en la raiz del proyecto")
    else:
        print(f"Ejecutando: {script_path}\n")
        ejecutar_script_sql(script_path)

