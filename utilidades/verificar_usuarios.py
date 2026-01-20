"""
Verificar estructura de la tabla usuarios
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import mysql.connector
from config import DB_CONFIG

try:
    conexion = mysql.connector.connect(**DB_CONFIG)
    cursor = conexion.cursor()
    
    # Verificar estructura
    cursor.execute("DESCRIBE usuarios")
    columnas = cursor.fetchall()
    print("Estructura de la tabla usuarios:")
    for col in columnas:
        print(f"  - {col[0]} ({col[1]})")
    
    # Verificar primary key
    cursor.execute("SHOW KEYS FROM usuarios WHERE Key_name = 'PRIMARY'")
    pk = cursor.fetchall()
    print(f"\nPrimary Key: {pk[0][4] if pk else 'No encontrada'}")
    
    cursor.close()
    conexion.close()
    
except Exception as e:
    print(f"Error: {e}")

