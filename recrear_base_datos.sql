-- ============================================================================
-- SCRIPT PARA RECREAR LA BASE DE DATOS COMPLETA
-- Sistema de Gestión de Eventos - Lirios Eventos
-- ============================================================================
-- Este script elimina la base de datos existente (si existe) y la recrea
-- desde cero usando los archivos SQL consolidados.
-- 
-- ⚠️ ADVERTENCIA: Este script ELIMINARÁ todos los datos existentes
-- ============================================================================

-- Eliminar base de datos existente (si existe)
DROP DATABASE IF EXISTS lirios_eventos;

-- Crear nueva base de datos
CREATE DATABASE lirios_eventos 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE lirios_eventos;

-- ============================================================================
-- IMPORTANTE: Después de ejecutar este script, ejecuta en orden:
-- ============================================================================
-- 
-- 1. SOURCE 01_estructura_tablas.sql;
--    (Crea todas las tablas del sistema)
--
-- 2. SOURCE 02_triggers_funciones_procedimientos.sql;
--    (Crea triggers, funciones y procedimientos almacenados)
--
-- 3. SOURCE 03_datos_ejemplo.sql;
--    (Opcional: Inserta datos de ejemplo para desarrollo/testing)
--
-- ============================================================================
-- O desde la línea de comandos de MySQL:
-- ============================================================================
-- mysql -u root -p < recrear_base_datos.sql
-- mysql -u root -p lirios_eventos < 01_estructura_tablas.sql
-- mysql -u root -p lirios_eventos < 02_triggers_funciones_procedimientos.sql
-- mysql -u root -p lirios_eventos < 03_datos_ejemplo.sql  (opcional)
-- ============================================================================

