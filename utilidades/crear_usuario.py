"""
Script de utilidad para crear usuarios con contraseñas hasheadas
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from modelos.usuario_modelo import UsuarioModelo
from modelos.autenticacion import Autenticacion


def crear_usuario():
    """Crea un nuevo usuario desde la línea de comandos"""
    print("=== Crear Nuevo Usuario ===\n")
    
    nombre_usuario = input("Nombre de usuario: ").strip()
    if not nombre_usuario:
        print("Error: El nombre de usuario es requerido")
        return
    
    contrasena = input("Contraseña: ").strip()
    if not contrasena:
        print("Error: La contraseña es requerida")
        return
    
    nombre_completo = input("Nombre completo: ").strip()
    if not nombre_completo:
        print("Error: El nombre completo es requerido")
        return
    
    email = input("Email (opcional): ").strip() or None
    telefono = input("Teléfono (opcional): ").strip() or None
    
    print("\nRoles disponibles:")
    print("1. administrador")
    print("2. coordinador")
    print("3. gerente_general")
    print("4. cliente")
    
    rol_opcion = input("Seleccione el rol (1-4): ").strip()
    roles = {
        '1': 'administrador',
        '2': 'coordinador',
        '3': 'gerente_general',
        '4': 'cliente'
    }
    
    rol = roles.get(rol_opcion)
    if not rol:
        print("Error: Rol inválido")
        return
    
    # Hash de la contraseña
    auth = Autenticacion()
    contrasena_hash = auth.hash_contrasena(contrasena)
    
    # Crear usuario
    usuario_modelo = UsuarioModelo()
    datos_usuario = {
        'nombre_usuario': nombre_usuario,
        'contrasena': contrasena_hash,
        'nombre_completo': nombre_completo,
        'email': email,
        'telefono': telefono,
        'rol': rol
    }
    
    usuario_id = usuario_modelo.crear_usuario(datos_usuario)
    
    if usuario_id:
        print(f"\n✓ Usuario creado exitosamente con ID: {usuario_id}")
    else:
        print("\n✗ Error al crear el usuario")


if __name__ == "__main__":
    crear_usuario()

