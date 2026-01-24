-- Sistema de reintentos para mensajes WhatsApp fallidos

-- Agregar columnas para control de reintentos
ALTER TABLE whatsapp_mensajes
ALTER TABLE whatsapp_mensajes  ADD COLUMN intentos_reintento INT DEFAULT 0;
ALTER TABLE whatsapp_mensajes  ADD COLUMN fecha_ultimo_reintento TIMESTAMP NULL;
ALTER TABLE whatsapp_mensajes  ADD COLUMN pendiente_reintento TINYINT(1) DEFAULT 0;
ALTER TABLE whatsapp_mensajes  ADD COLUMN max_intentos_reintento INT DEFAULT 3;

-- Índice para búsqueda eficiente de mensajes pendientes
ALTER TABLE whatsapp_mensajes
  ADD INDEX   idx_pendiente_reintento (pendiente_reintento, estado, fecha_creacion);

-- Actualizar mensajes fallidos existentes para marcarlos como pendientes (excepto errores no recuperables)
UPDATE whatsapp_mensajes
SET pendiente_reintento = 1
WHERE estado = 'fallido'
  AND direccion = 'out'
  AND pendiente_reintento = 0
  AND intentos_reintento < COALESCE(max_intentos_reintento, 3)
  AND (
    -- Excluir errores de ventana 24h (131047)
    raw_json NOT LIKE '%131047%'
    OR raw_json IS NULL
  );
