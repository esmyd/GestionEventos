"""
Verificar foreign keys de la tabla eventos
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import mysql.connector
from config import DB_CONFIG

try:
    conexion = mysql.connector.connect(**DB_CONFIG)
    cursor = conexion.cursor()
    
    # Verificar foreign keys de eventos
    cursor.execute("""
        SELECT 
            CONSTRAINT_NAME,
            TABLE_NAME,
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'eventos'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    """)
    
    fks = cursor.fetchall()
    print("Foreign Keys de la tabla eventos:")
    for fk in fks:
        print(f"  {fk[0]}: {fk[2]} -> {fk[3]}.{fk[4]}")
    
    # Verificar estructura de clientes
    cursor.execute("SHOW KEYS FROM clientes WHERE Key_name = 'PRIMARY'")
    pk_cliente = cursor.fetchall()
    print(f"\nPrimary Key de clientes: {pk_cliente[0][4] if pk_cliente else 'No encontrada'}")
    
    cursor.close()
    conexion.close()
    
except Exception as e:
    print(f"Error: {e}")

