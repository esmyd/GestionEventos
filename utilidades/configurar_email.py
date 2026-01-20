"""
Script de utilidad para configurar el archivo .env con las credenciales de email
"""
import os
import sys

# Configurar encoding UTF-8 para Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

def configurar_email():
    """Guía interactiva para configurar el archivo .env"""
    print("="*60)
    print("Configuración de Email - Lirios Eventos")
    print("="*60)
    print("\nEste script te ayudará a configurar las credenciales de email.")
    print("Las credenciales se guardarán en el archivo .env\n")
    
    # Verificar si .env ya existe
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    if os.path.exists(env_path):
        respuesta = input("El archivo .env ya existe. ¿Deseas sobrescribirlo? (s/n): ")
        if respuesta.lower() != 's':
            print("Operación cancelada.")
            return
    
    # Solicitar información
    print("\nPor favor, ingresa la siguiente información:\n")
    
    smtp_server = input("Servidor SMTP (ej: smtp.tu-hosting.com): ").strip()
    smtp_port = input("Puerto SMTP (587 para TLS, 465 para SSL, 25 sin encriptación) [587]: ").strip() or "587"
    email_from = input("Email desde el cual se enviarán los correos: ").strip()
    email_password = input("Contraseña del email: ").strip()
    
    print("\nConfiguración de encriptación:")
    print("1. TLS (puerto 587) - Recomendado")
    print("2. SSL (puerto 465)")
    print("3. Sin encriptación (puerto 25)")
    
    opcion = input("Selecciona una opción [1]: ").strip() or "1"
    
    if opcion == "2":
        use_tls = "False"
        use_ssl = "True"
        if smtp_port == "587":
            smtp_port = "465"
    elif opcion == "3":
        use_tls = "False"
        use_ssl = "False"
        if smtp_port not in ["25", "465", "587"]:
            smtp_port = "25"
    else:
        use_tls = "True"
        use_ssl = "False"
        if smtp_port not in ["25", "465", "587"]:
            smtp_port = "587"
    
    email_from_name = input("Nombre del remitente [Lirios Eventos]: ").strip() or "Lirios Eventos"
    
    # Crear contenido del archivo .env
    contenido = f"""# Configuración de Email (SMTP)
# IMPORTANTE: Este archivo contiene información sensible. NO lo subas a Git.

# Servidor SMTP de tu hosting
SMTP_SERVER={smtp_server}

# Puerto SMTP ({smtp_port} para {'SSL' if use_ssl == 'True' else 'TLS' if use_tls == 'True' else 'sin encriptación'})
SMTP_PORT={smtp_port}

# Email desde el cual se enviarán los correos
EMAIL_FROM={email_from}

# Contraseña del email
EMAIL_PASSWORD={email_password}

# Usar TLS (True/False)
SMTP_USE_TLS={use_tls}

# Usar SSL (True/False)
SMTP_USE_SSL={use_ssl}

# Nombre del remitente
EMAIL_FROM_NAME={email_from_name}
"""
    
    # Guardar archivo
    try:
        with open(env_path, 'w', encoding='utf-8') as f:
            f.write(contenido)
        
        print("\n" + "="*60)
        print("✓ Configuración guardada exitosamente en .env")
        print("="*60)
        print(f"\nArchivo creado en: {env_path}")
        print("\nIMPORTANTE:")
        print("- El archivo .env contiene información sensible")
        print("- NO lo subas a Git (ya está en .gitignore)")
        print("- Mantén tus credenciales seguras")
        print("\nPuedes probar el envío de correos desde la aplicación.")
        
    except Exception as e:
        print(f"\n✗ Error al guardar el archivo: {e}")
        print(f"Intenta crear el archivo .env manualmente en: {env_path}")

if __name__ == "__main__":
    configurar_email()

