-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 20-08-2024 a las 20:26:17
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gestion_vehicular`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `spAuditoriaVehiculo` (IN `_NUM_ECONOMICO` CHAR(12), IN `_ESTADO_FISICO` VARCHAR(30), IN `_NIVEL` INT, IN `_ESTADON1` INT, IN `_ESTADON2` INT, IN `_ESTADON3` INT, IN `_ESTADON4` INT)   BEGIN
    -- Actualiza el estado_fisico en la tabla vehiculos
    UPDATE vehiculos 
    SET estado_fisico = _ESTADO_FISICO 
    WHERE num_economico = _NUM_ECONOMICO;
    
    -- Actualiza o inserta el nivel en la tabla combustible
    IF EXISTS (SELECT 1 FROM combustible WHERE num_economico = _NUM_ECONOMICO) THEN
        UPDATE combustible 
        SET nivel = _NIVEL 
        WHERE num_economico = _NUM_ECONOMICO;
    ELSE
        INSERT INTO combustible
        VALUES (_NUM_ECONOMICO, _NIVEL);
    END IF;

    -- Actualiza o inserta el estado de los neumáticos en la tabla neumaticos
    IF EXISTS (SELECT 1 FROM neumaticos WHERE num_economico = _NUM_ECONOMICO) THEN
        UPDATE neumaticos 
        SET estadoN1 = _ESTADON1, 
            estadoN2 = _ESTADON2, 
            estadoN3 = _ESTADON3, 
            estadoN4 = _ESTADON4 
        WHERE num_economico = _NUM_ECONOMICO;
    ELSE
        INSERT INTO neumaticos
        VALUES (_NUM_ECONOMICO, _ESTADON1, _ESTADON2, _ESTADON3, _ESTADON4);
    END IF;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `accidentes`
--

CREATE TABLE `accidentes` (
  `idAccidente` char(34) NOT NULL,
  `num_economico` char(12) NOT NULL,
  `idUsuario` char(34) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asignaciones`
--

CREATE TABLE `asignaciones` (
  `idUsuario` char(34) NOT NULL,
  `num_economico` char(12) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `asignaciones`
--
DELIMITER $$
CREATE TRIGGER `after_asignaciones_delete` AFTER DELETE ON `asignaciones` FOR EACH ROW BEGIN
    UPDATE historial_asignaciones
    SET fecha_liberacion = NOW()
    WHERE idUsuario = OLD.idUsuario AND num_economico = OLD.num_economico
    AND fecha_liberacion IS NULL;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_asignaciones_insert` AFTER INSERT ON `asignaciones` FOR EACH ROW BEGIN
    INSERT INTO historial_asignaciones (idUsuario, num_economico, fecha_asignacion)
    VALUES (NEW.idUsuario, NEW.num_economico, NOW());
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `combustible`
--

CREATE TABLE `combustible` (
  `num_economico` char(12) NOT NULL,
  `nivel` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_asignaciones`
--

CREATE TABLE `historial_asignaciones` (
  `idUsuario` char(34) NOT NULL,
  `num_economico` char(12) NOT NULL,
  `fecha_asignacion` date NOT NULL DEFAULT current_timestamp(),
  `fecha_liberacion` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `infracciones`
--

CREATE TABLE `infracciones` (
  `idInfraccion` char(34) NOT NULL,
  `num_economico` char(12) NOT NULL,
  `idUsuario` char(34) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `costo` decimal(10,0) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mantenimientos`
--

CREATE TABLE `mantenimientos` (
  `idMantenimiento` char(34) NOT NULL,
  `num_economico` char(13) NOT NULL,
  `fecha` date NOT NULL,
  `destino` varchar(255) NOT NULL,
  `costo` decimal(10,0) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `neumaticos`
--

CREATE TABLE `neumaticos` (
  `num_economico` char(12) NOT NULL,
  `estadoN1` int(11) NOT NULL,
  `estadoN2` int(11) NOT NULL,
  `estadoN3` int(11) NOT NULL,
  `estadoN4` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `propietario_vehiculo`
--

CREATE TABLE `propietario_vehiculo` (
  `idPropietario` char(34) NOT NULL,
  `nombre_prop` varchar(50) NOT NULL,
  `ap1_prop` varchar(50) NOT NULL,
  `ap2_prop` varchar(50) NOT NULL,
  `foto_prop` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reparaciones`
--

CREATE TABLE `reparaciones` (
  `idReparacion` char(34) NOT NULL,
  `num_economico` char(12) NOT NULL,
  `detalle` text NOT NULL,
  `fecha_ingreso` date NOT NULL,
  `fecha_salida` date NOT NULL,
  `costo` decimal(10,0) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `idUsuario` char(34) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `ap1` varchar(50) NOT NULL,
  `ap2` varchar(50) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `genero` enum('M','F','OTRO') NOT NULL,
  `rol` enum('ADMINISTRADOR','PROPIETARIO') NOT NULL,
  `foto` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`idUsuario`, `nombre`, `ap1`, `ap2`, `correo`, `contrasena`, `genero`, `rol`, `foto`) VALUES
('e6047d18-55e1-4415-ba04-adde67f067', 'Admin', 'Admin', 'Admin', 'admin@admin.com', '$2a$08$4wQLXguVSYMUMeL8tt0Sf.3P6dZ7RxNgBRuPO8p8KRCksOkojo/ci', 'M', 'ADMINISTRADOR', '/uploads/user-img/USUARIO - 1723673369978.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vehiculos`
--

CREATE TABLE `vehiculos` (
  `num_economico` char(12) NOT NULL,
  `marca` varchar(50) NOT NULL,
  `submarca` varchar(50) NOT NULL,
  `descripcion` text NOT NULL,
  `modelo` char(4) NOT NULL,
  `placa` char(10) NOT NULL,
  `situacion` enum('PROPIEDAD','ARRENDADO') NOT NULL,
  `estado_fisico` enum('BUENO','REGULAR','MALO','') NOT NULL,
  `num_serie` varchar(30) NOT NULL,
  `num_motor` varchar(30) NOT NULL,
  `cilindros` char(1) NOT NULL,
  `transmision` enum('MANUAL','AUTOMATICA') NOT NULL,
  `idPropietario` char(34) DEFAULT NULL,
  `foto_unidad` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `accidentes`
--
ALTER TABLE `accidentes`
  ADD PRIMARY KEY (`idAccidente`),
  ADD KEY `idUsuario` (`idUsuario`),
  ADD KEY `num_economico` (`num_economico`);

--
-- Indices de la tabla `asignaciones`
--
ALTER TABLE `asignaciones`
  ADD KEY `idUsuario` (`idUsuario`),
  ADD KEY `num_economico` (`num_economico`);

--
-- Indices de la tabla `combustible`
--
ALTER TABLE `combustible`
  ADD KEY `num_economico` (`num_economico`);

--
-- Indices de la tabla `historial_asignaciones`
--
ALTER TABLE `historial_asignaciones`
  ADD KEY `idUsuario` (`idUsuario`),
  ADD KEY `num_economico` (`num_economico`);

--
-- Indices de la tabla `infracciones`
--
ALTER TABLE `infracciones`
  ADD PRIMARY KEY (`idInfraccion`),
  ADD KEY `num_economico` (`num_economico`),
  ADD KEY `idUsuario` (`idUsuario`);

--
-- Indices de la tabla `mantenimientos`
--
ALTER TABLE `mantenimientos`
  ADD PRIMARY KEY (`idMantenimiento`),
  ADD KEY `num_economico` (`num_economico`);

--
-- Indices de la tabla `neumaticos`
--
ALTER TABLE `neumaticos`
  ADD KEY `idVehiculo` (`num_economico`);

--
-- Indices de la tabla `propietario_vehiculo`
--
ALTER TABLE `propietario_vehiculo`
  ADD PRIMARY KEY (`idPropietario`);

--
-- Indices de la tabla `reparaciones`
--
ALTER TABLE `reparaciones`
  ADD PRIMARY KEY (`idReparacion`),
  ADD KEY `num_economico` (`num_economico`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`idUsuario`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- Indices de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  ADD PRIMARY KEY (`num_economico`),
  ADD UNIQUE KEY `num_serie` (`num_serie`),
  ADD KEY `idPropietario` (`idPropietario`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `accidentes`
--
ALTER TABLE `accidentes`
  ADD CONSTRAINT `accidentes_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `accidentes_ibfk_2` FOREIGN KEY (`num_economico`) REFERENCES `vehiculos` (`num_economico`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `asignaciones`
--
ALTER TABLE `asignaciones`
  ADD CONSTRAINT `asignaciones_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `asignaciones_ibfk_2` FOREIGN KEY (`num_economico`) REFERENCES `vehiculos` (`num_economico`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `combustible`
--
ALTER TABLE `combustible`
  ADD CONSTRAINT `combustible_ibfk_1` FOREIGN KEY (`num_economico`) REFERENCES `vehiculos` (`num_economico`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `historial_asignaciones`
--
ALTER TABLE `historial_asignaciones`
  ADD CONSTRAINT `fk_usuarios_asign` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_vehiculos_asign` FOREIGN KEY (`num_economico`) REFERENCES `vehiculos` (`num_economico`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `infracciones`
--
ALTER TABLE `infracciones`
  ADD CONSTRAINT `infracciones_ibfk_1` FOREIGN KEY (`num_economico`) REFERENCES `vehiculos` (`num_economico`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `infracciones_ibfk_2` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `mantenimientos`
--
ALTER TABLE `mantenimientos`
  ADD CONSTRAINT `mantenimientos_ibfk_1` FOREIGN KEY (`num_economico`) REFERENCES `vehiculos` (`num_economico`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `neumaticos`
--
ALTER TABLE `neumaticos`
  ADD CONSTRAINT `neumaticos_ibfk_1` FOREIGN KEY (`num_economico`) REFERENCES `vehiculos` (`num_economico`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `reparaciones`
--
ALTER TABLE `reparaciones`
  ADD CONSTRAINT `reparaciones_ibfk_1` FOREIGN KEY (`num_economico`) REFERENCES `vehiculos` (`num_economico`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  ADD CONSTRAINT `vehiculos_ibfk_1` FOREIGN KEY (`idPropietario`) REFERENCES `propietario_vehiculo` (`idPropietario`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
