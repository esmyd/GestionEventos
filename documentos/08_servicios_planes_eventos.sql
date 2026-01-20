-- Tablas para servicios de planes y eventos
CREATE TABLE IF NOT EXISTS plan_servicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  orden INT DEFAULT 0,
  activo TINYINT(1) DEFAULT 1,
  CONSTRAINT plan_servicios_ibfk_1 FOREIGN KEY (plan_id) REFERENCES planes (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS evento_servicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evento_id INT NOT NULL,
  plan_servicio_id INT NULL,
  nombre VARCHAR(200) NOT NULL,
  orden INT DEFAULT 0,
  completado TINYINT(1) DEFAULT 0,
  fecha_actualizacion TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT evento_servicios_ibfk_1 FOREIGN KEY (evento_id) REFERENCES eventos (id_evento) ON DELETE CASCADE,
  CONSTRAINT evento_servicios_ibfk_2 FOREIGN KEY (plan_servicio_id) REFERENCES plan_servicios (id) ON DELETE SET NULL
);
