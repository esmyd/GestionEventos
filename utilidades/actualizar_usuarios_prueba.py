"""
Script para actualizar las contraseñas de los usuarios de prueba
para que coincidan con las mostradas en el login
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import mysql.connector
from config import DB_CONFIG
import hashlib

def actualizar_usuarios_prueba():
    """Actualiza las contraseñas de los usuarios de prueba"""
    try:
        conexion = mysql.connector.connect(**DB_CONFIG)
        cursor = conexion.cursor()
        
        # Hashes correctos
        hash_admin = hashlib.sha256('admin123'.encode()).hexdigest()
        hash_gerente = hashlib.sha256('gerente123'.encode()).hexdigest()
        hash_coordinador = hashlib.sha256('coordinador123'.encode()).hexdigest()
        
        print("Actualizando contrasenas de usuarios de prueba...")
        
        # Actualizar admin
        cursor.execute(
            "UPDATE usuarios SET contrasena = %s WHERE nombre_usuario = 'admin'",
            (hash_admin,)
        )
        print(f"[OK] admin actualizado (admin123)")
        
        # Actualizar gerente
        cursor.execute(
            "UPDATE usuarios SET contrasena = %s WHERE nombre_usuario = 'gerente'",
            (hash_gerente,)
        )
        print(f"[OK] gerente actualizado (gerente123)")
        
        # Actualizar coordinador1
        cursor.execute(
            "UPDATE usuarios SET contrasena = %s WHERE nombre_usuario = 'coordinador1'",
            (hash_coordinador,)
        )
        print(f"[OK] coordinador1 actualizado (coordinador123)")
        
        # Verificar si coordinador2 existe y actualizarlo también
        cursor.execute(
            "UPDATE usuarios SET contrasena = %s WHERE nombre_usuario = 'coordinador2'",
            (hash_coordinador,)
        )
        if cursor.rowcount > 0:
            print(f"[OK] coordinador2 actualizado (coordinador123)")
        
        # Crear usuarios si no existen
        usuarios_crear = [
            ('admin', hash_admin, 'Administrador del Sistema', 'admin@lirioseventos.com', '1234567890', 'administrador'),
            ('gerente', hash_gerente, 'Gerente General', 'gerente@lirioseventos.com', '0987654321', 'gerente_general'),
            ('coordinador1', hash_coordinador, 'María González', 'maria.gonzalez@lirioseventos.com', '1111111111', 'coordinador'),
        ]
        
        for usuario, hash_pass, nombre, email, telefono, rol in usuarios_crear:
            cursor.execute(
                """INSERT INTO usuarios (nombre_usuario, contrasena, nombre_completo, email, telefono, rol, activo)
                   VALUES (%s, %s, %s, %s, %s, %s, TRUE)
                   ON DUPLICATE KEY UPDATE 
                       contrasena = VALUES(contrasena),
                       nombre_completo = VALUES(nombre_completo),
                       email = VALUES(email),
                       telefono = VALUES(telefono),
                       rol = VALUES(rol),
                       activo = TRUE""",
                (usuario, hash_pass, nombre, email, telefono, rol)
            )
        
        conexion.commit()
        
        # Verificar usuarios
        print("\nVerificando usuarios de prueba:")
        cursor.execute(
            """SELECT nombre_usuario, nombre_completo, rol, activo,
                      CASE 
                          WHEN contrasena = %s THEN 'admin123 [OK]'
                          WHEN contrasena = %s THEN 'gerente123 [OK]'
                          WHEN contrasena = %s THEN 'coordinador123 [OK]'
                          ELSE 'Contrasena diferente'
                      END as contrasena_verificada
               FROM usuarios 
               WHERE nombre_usuario IN ('admin', 'gerente', 'coordinador1', 'coordinador2')
               ORDER BY nombre_usuario""",
            (hash_admin, hash_gerente, hash_coordinador)
        )
        
        resultados = cursor.fetchall()
        for row in resultados:
            print(f"  - {row[0]}: {row[1]} ({row[2]}) - {row[4]}")
        
        print("\n[OK] Usuarios de prueba actualizados correctamente")
        cursor.close()
        conexion.close()
        
    except mysql.connector.Error as e:
        print(f"Error al actualizar usuarios: {e}")
    except Exception as e:
        print(f"Error inesperado: {e}")

if __name__ == '__main__':
    actualizar_usuarios_prueba()
