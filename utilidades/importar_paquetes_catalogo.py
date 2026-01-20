"""
Script para importar los paquetes del catálogo "50 Personas" a la base de datos
"""
from modelos.plan_modelo import PlanModelo
from modelos.salon_modelo import SalonModelo
from utilidades.logger import obtener_logger

logger = obtener_logger()


def importar_salon_brisas_lirio():
    """Crea o actualiza el salón Brisas de Lirio"""
    salon_modelo = SalonModelo()
    
    # Verificar si ya existe
    salones = salon_modelo.obtener_todos_salones()
    salon_existente = next((s for s in salones if s['nombre'] == 'Brisas de Lirio'), None)
    
    if salon_existente:
        logger.info(f"Salón 'Brisas de Lirio' ya existe con ID: {salon_existente['id_salon']}")
        return salon_existente['id_salon']
    
    # Crear el salón
    datos_salon = {
        'nombre': 'Brisas de Lirio',
        'capacidad': 50,
        'ubicacion': 'Av. Francisco de Orellana. Samanes 3, Mz. 311 Sl 1',
        'descripcion': 'Salón Brisas de Lirio climatizado y aromatizado durante 6 horas de evento',
        'precio_base': 0.00,
        'activo': True
    }
    
    salon_id = salon_modelo.crear_salon(datos_salon)
    if salon_id:
        logger.info(f"Salón 'Brisas de Lirio' creado con ID: {salon_id}")
        return salon_id
    else:
        logger.error("Error al crear el salón 'Brisas de Lirio'")
        return None


def importar_paquetes():
    """Importa los 4 paquetes del catálogo"""
    plan_modelo = PlanModelo()
    
    paquetes = [
        {
            'nombre': 'Paquete Cristal',
            'descripcion': 'Paquete básico para eventos de 50 personas en el Salón Brisas de Lirio',
            'precio_base': 1210.00,
            'capacidad_minima': 50,
            'capacidad_maxima': 50,
            'duracion_horas': 6,
            'incluye': '''Salón Brisas de Lirio climatizado y aromatizado durante 6 horas de evento
Menaje decorativo: Cortinas de tela tul, pallets, accesorios de bocaditos, mesas, sillas tiffany, torta falsa
Decoración con luces LED acorde al evento
Buffet: 1 Proteína + 1 Guarnición + 1 Ensalada
Vajilla completa. Platos, vasos, tenedores, copas, servilletas
Bebidas Soft ilimitadas durante el evento. Agua, mineral, hielo, colas
Personal de servicio: Coordinación antes y durante el evento, Montaje y Desmontaje, Servicio DJ, Personal Anfitrión de ingreso, Personal para la asistencia de mesa de invitados, Guardianía
Garantía: Se solicita $60 de garantía reembolsable al siguiente día hábil una vez constatado que el SALÓN y sus materiales están en buenas condiciones'''
        },
        {
            'nombre': 'Paquete Destello',
            'descripcion': 'Paquete mejorado para eventos de 50 personas con arreglos florales y bocaditos',
            'precio_base': 1310.00,
            'capacidad_minima': 50,
            'capacidad_maxima': 50,
            'duracion_horas': 6,
            'incluye': '''Salón Brisas de Lirio climatizado y aromatizado durante 6 horas de evento
Menaje decorativo: Cortinas de tela tul, pallets, accesorios de bocaditos, flores artificiales, mesas, sillas tiffany, torta falsa
Decoración con luces LED acorde al evento
5 arreglos florales naturales
Buffet: 1 Proteína + 1 Guarnición + 1 Ensalada
Vajilla completa. Platos, vasos, tenedores, copas, servilletas
Bebidas Soft ilimitadas durante el evento. Agua, mineral, hielo, colas
Bocaditos: 250 bocaditos de dulce
Personal de servicio: Coordinación antes y durante el evento, Montaje y Desmontaje, Servicio DJ, Personal Anfitrión de ingreso, Personal para la asistencia de mesa de invitados, Guardianía
Cortesía: Cámara de Humo, Brindis
Garantía: Se solicita $60 de garantía reembolsable al siguiente día hábil una vez constatado que el SALÓN y sus materiales están en buenas condiciones'''
        },
        {
            'nombre': 'Paquete Luz',
            'descripcion': 'Paquete completo para eventos de 50 personas con buffet mejorado y más bocaditos',
            'precio_base': 1660.00,
            'capacidad_minima': 50,
            'capacidad_maxima': 50,
            'duracion_horas': 6,
            'incluye': '''Salón Brisas de Lirio climatizado y aromatizado durante 6 horas de evento
Menaje decorativo: Cortinas de tela tul, pallets, accesorios de bocaditos, flores artificiales, mesas, sillas tiffany, torta falsa
Decoración con luces LED acorde al evento
5 arreglos florales naturales
Buffet: 2 Proteínas + 1 Guarnición + 1 Ensalada
Vajilla completa. Platos, vasos, tenedores, copas, servilletas
Bebidas Soft ilimitadas durante el evento. Agua, mineral, hielo, colas
Bocaditos: 300 bocaditos de dulce y 300 bocaditos de sal
Personal de servicio: Coordinación antes y durante el evento, Montaje y Desmontaje, Servicio DJ, Personal Anfitrión de ingreso, Personal para la asistencia de mesa de invitados, Guardianía
Cortesía: Cámara de Humo, Brindis
Garantía: Se solicita $60 de garantía reembolsable al siguiente día hábil una vez constatado que el SALÓN y sus materiales están en buenas condiciones'''
        },
        {
            'nombre': 'Paquete Resplandor',
            'descripcion': 'Paquete premium para eventos de 50 personas con servicios adicionales completos',
            'precio_base': 2010.00,
            'capacidad_minima': 50,
            'capacidad_maxima': 50,
            'duracion_horas': 6,
            'incluye': '''Salón Brisas de Lirio climatizado y aromatizado durante 6 horas de evento
Menaje decorativo: Cortinas de tela tul, pallets, accesorios de bocaditos, flores artificiales, mesas, sillas tiffany, torta falsa
Decoración con luces LED acorde al evento
5 arreglos florales naturales
Buffet: 1 Proteína + 1 Guarnición + 1 Ensalada
Vajilla completa. Platos, vasos, tenedores, copas, servilletas
Bebidas Soft ilimitadas durante el evento. Agua, mineral, hielo, colas
Bocaditos: 250 bocaditos de dulce y 250 bocaditos de sal
Personal de servicio: Coordinación antes y durante el evento, Montaje y Desmontaje, Servicio DJ, Personal Anfitrión de ingreso, Personal para la asistencia de mesa de invitados, Guardianía
Servicios Adicionales: 2 Galones de coctel, Degustación: 2 platos, Animador durante todo el evento, 50 Porciones de torta: Masa de manzana/nueces - chocolate - vainilla, Hora loca: 2 garrotes y robot LED
Cortesía: Brindis, Cámara de humo
Garantía: Se solicita $60 de garantía reembolsable al siguiente día hábil una vez constatado que el SALÓN y sus materiales están en buenas condiciones'''
        }
    ]
    
    logger.info("Iniciando importación de paquetes del catálogo...")
    
    # Primero crear el salón
    salon_id = importar_salon_brisas_lirio()
    
    # Importar cada paquete
    for paquete in paquetes:
        # Verificar si ya existe
        planes = plan_modelo.obtener_todos_planes(solo_activos=False)
        plan_existente = next((p for p in planes if p['nombre'] == paquete['nombre']), None)
        
        if plan_existente:
            logger.info(f"Paquete '{paquete['nombre']}' ya existe con ID: {plan_existente['id']}")
            # Actualizar si es necesario
            plan_modelo.actualizar_plan(plan_existente['id'], paquete)
            logger.info(f"Paquete '{paquete['nombre']}' actualizado")
        else:
            plan_id = plan_modelo.crear_plan(paquete)
            if plan_id:
                logger.info(f"Paquete '{paquete['nombre']}' creado con ID: {plan_id}")
            else:
                logger.error(f"Error al crear el paquete '{paquete['nombre']}'")
    
    logger.info("Importación de paquetes completada")


if __name__ == "__main__":
    try:
        importar_paquetes()
        print("\n✅ Importación completada exitosamente")
        print("\nPaquetes importados:")
        print("  - Paquete Cristal: $1,210.00")
        print("  - Paquete Destello: $1,310.00")
        print("  - Paquete Luz: $1,660.00")
        print("  - Paquete Resplandor: $2,010.00")
        print("\nLos paquetes ya están disponibles en la aplicación.")
    except Exception as e:
        logger.error(f"Error durante la importación: {str(e)}")
        print(f"\n❌ Error durante la importación: {str(e)}")
        raise

