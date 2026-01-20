"""
Script para verificar la configuración de email
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configurar encoding UTF-8 para Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

print("="*60)
print("Verificación de Configuración de Email")
print("="*60)

smtp_server = os.getenv('SMTP_SERVER', '').strip()
smtp_port = os.getenv('SMTP_PORT', '587').strip()
email_from = os.getenv('EMAIL_FROM', '').strip()
email_password = os.getenv('EMAIL_PASSWORD', '').strip()
use_ssl = os.getenv('SMTP_USE_SSL', 'False').strip().lower()
use_tls = os.getenv('SMTP_USE_TLS', 'True').strip().lower()

print(f"\nConfiguración actual:")
print(f"  SMTP_SERVER: {smtp_server}")
print(f"  SMTP_PORT: {smtp_port}")
print(f"  EMAIL_FROM: {email_from}")
print(f"  EMAIL_PASSWORD: {'*' * len(email_password) if email_password else '(no configurado)'}")
print(f"  SMTP_USE_SSL: {use_ssl}")
print(f"  SMTP_USE_TLS: {use_tls}")

print(f"\nAnálisis:")
problemas = []

# Verificar servidor SMTP
if not smtp_server:
    problemas.append("❌ SMTP_SERVER no está configurado")
elif smtp_server.lower() == "smtp":
    problemas.append("❌ SMTP_SERVER está configurado como 'smtp' - debe ser un hostname completo")
    print(f"   Ejemplo: smtp.siglotecnologico.com, smtp.gmail.com, mail.tudominio.com")
elif "." not in smtp_server:
    problemas.append("❌ SMTP_SERVER parece no ser un hostname válido (no contiene punto)")
else:
    print(f"[OK] SMTP_SERVER parece válido: {smtp_server}")

# Verificar puerto
try:
    port_num = int(smtp_port)
    if port_num == 465:
        if use_ssl not in ('true', '1', 'yes', 'on'):
            problemas.append("⚠️  Puerto 465 requiere SMTP_USE_SSL=True")
        if use_tls in ('true', '1', 'yes', 'on'):
            problemas.append("⚠️  Puerto 465 no debe usar SMTP_USE_TLS=True (usa SSL directamente)")
    elif port_num == 587:
        if use_ssl in ('true', '1', 'yes', 'on'):
            problemas.append("⚠️  Puerto 587 no debe usar SMTP_USE_SSL=True (usa TLS)")
        if use_tls not in ('true', '1', 'yes', 'on'):
            problemas.append("⚠️  Puerto 587 requiere SMTP_USE_TLS=True")
    print(f"[OK] Puerto configurado: {port_num}")
except ValueError:
    problemas.append(f"❌ SMTP_PORT '{smtp_port}' no es un número válido")

# Verificar email
if not email_from:
    problemas.append("❌ EMAIL_FROM no está configurado")
elif "@" not in email_from:
    problemas.append("❌ EMAIL_FROM no parece ser un email válido")
else:
    print(f"[OK] EMAIL_FROM configurado: {email_from}")

# Verificar contraseña
if not email_password:
    problemas.append("❌ EMAIL_PASSWORD no está configurado")
else:
    print(f"[OK] EMAIL_PASSWORD configurado (longitud: {len(email_password)})")

if problemas:
    print(f"\n{'='*60}")
    print("PROBLEMAS ENCONTRADOS:")
    print("="*60)
    for problema in problemas:
        print(f"  {problema}")
    
    print(f"\n{'='*60}")
    print("CONFIGURACIONES RECOMENDADAS:")
    print("="*60)
    
    if port_num == 465:
        print("\nPara puerto 465 (SSL):")
        print("  SMTP_USE_SSL=True")
        print("  SMTP_USE_TLS=False")
    elif port_num == 587:
        print("\nPara puerto 587 (TLS):")
        print("  SMTP_USE_SSL=False")
        print("  SMTP_USE_TLS=True")
    
    if smtp_server.lower() == "smtp" or "." not in smtp_server:
        print("\nEjemplos de SMTP_SERVER según tu dominio:")
        print("  - Si usas siglotecnologico.com: smtp.siglotecnologico.com")
        print("  - Si usas Gmail: smtp.gmail.com")
        print("  - Si usas Hostinger: smtp.hostinger.com")
        print("  - Si usas otro proveedor: consulta la documentación de tu proveedor")
else:
    print(f"\n{'='*60}")
    print("[OK] Configuración parece correcta")
    print("="*60)
    print("\nSi aún tienes problemas, verifica:")
    print("  1. Que el servidor SMTP esté accesible desde tu red")
    print("  2. Que las credenciales sean correctas")
    print("  3. Que no haya firewall bloqueando el puerto")
    print("  4. Que tu proveedor de email permita conexiones SMTP")

print("\n" + "="*60)

