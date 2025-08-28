-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Erstellungszeit: 28. Aug 2025 um 13:27
-- Server-Version: 8.0.36-28
-- PHP-Version: 8.1.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `lampadina`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `attributes`
--

CREATE TABLE `attributes` (
  `id` int NOT NULL,
  `code` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `attributes`
--

INSERT INTO `attributes` (`id`, `code`, `label`) VALUES
(5, 'color', 'Farbe'),
(6, 'power', 'Leistung'),
(7, 'type', 'Type'),
(8, 'pack_size', 'Überverpackung'),
(9, 'ean', 'Hersteller EAN'),
(10, 'motion_sensor', 'Mit Bewegungsmelder'),
(11, 'luminous_flux_lm', 'Bemessungslichtstrom (lm)'),
(12, 'manufacturer_no', 'Hersteller Artikelnummer'),
(13, 'voltage_range', 'Nennspannung'),
(14, 'wall_mount', 'Geeignet für Wandmontage'),
(15, 'dimmable', 'Ohne Dimmfunktion'),
(16, 'housing_material', 'Werkstoff des Gehäuses'),
(17, 'socket', 'Fassung'),
(18, 'light_color', 'Lichtfarbe'),
(19, 'housing_color', 'Gehäusefarbe'),
(20, 'surface_mount', 'Geeignet für Aufbaumontage'),
(21, 'protection_class', 'Schutzklasse nach IEC 61140'),
(22, 'sdcm', 'Farbkonsistenz (MacAdam)'),
(23, 'max_system_power_w', 'Max. Systemleistung (W)'),
(24, 'ip_rating', 'Schutzart (IP)'),
(25, 'current_ma', 'Nennstrom (mA)'),
(26, 'en_light_color', 'Lichtfarbe nach EN 12464‑1'),
(27, 'built_in_led', 'Mit Leuchtmittel'),
(28, 'height_mm', 'Höhe/Tiefe (mm)'),
(29, 'width_mm', 'Breite (mm)'),
(30, 'cri', 'Farbwiedergabeindex CRI'),
(31, 'ceiling_mount', 'Geeignet für Deckenmontage'),
(32, 'pendant_mount', 'Geeignet für Pendelaufhängung'),
(33, 'outdoor_suitable', 'Geeignet für Außenmontage'),
(34, 'damp_location', 'Geeignet für Feuchträume');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `attribute_options`
--

CREATE TABLE `attribute_options` (
  `id` int NOT NULL,
  `attribute_id` int NOT NULL,
  `value` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `sort_order` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `attribute_options`
--

INSERT INTO `attribute_options` (`id`, `attribute_id`, `value`, `label`, `sort_order`) VALUES
(11, 5, 'anthrazit', 'anthrazit', 1),
(12, 5, 'weiss', 'weiß', 2),
(13, 6, '3_3W', '3,3 W', 1),
(14, 6, '5W', '5 W', 2),
(15, 6, '8W', '8 W', 3),
(16, 27, 'ja', 'ja', 1),
(17, 31, 'ja', 'ja', 1),
(18, 34, 'ja', 'ja', 1),
(19, 15, 'ja', 'ja', 1),
(20, 10, 'ja', 'ja', 1),
(21, 33, 'ja', 'ja', 1),
(22, 32, 'ja', 'ja', 1),
(23, 20, 'ja', 'ja', 1),
(24, 14, 'ja', 'ja', 1),
(31, 27, 'nein', 'nein', 2),
(32, 31, 'nein', 'nein', 2),
(33, 34, 'nein', 'nein', 2),
(34, 15, 'nein', 'nein', 2),
(35, 10, 'nein', 'nein', 2),
(36, 33, 'nein', 'nein', 2),
(37, 32, 'nein', 'nein', 2),
(38, 20, 'nein', 'nein', 2),
(39, 14, 'nein', 'nein', 2),
(46, 7, '61922_CALPINO_PRO', '61922 CALPINO PRO', 0),
(47, 8, '18', '18', 0),
(48, 9, '9002759619220', '9002759619220', 0),
(49, 11, '556', '556 lm', 0),
(50, 12, '61922', '61922', 0),
(51, 13, '220-240V', '220 bis 240 V', 0),
(52, 16, 'aluminium', 'Aluminium', 0),
(53, 17, 'ohne', 'ohne', 0),
(54, 18, 'weiss', 'weiß', 0),
(55, 19, 'schwarz', 'schwarz', 0),
(56, 21, 'II', 'II', 0),
(57, 22, 'SDCM6', 'SDCM6', 0),
(58, 23, '3_3', '3,3 W', 0),
(59, 24, 'IP54', 'IP54', 0),
(60, 25, '350', '350 mA', 0),
(61, 26, 'warmweiss_lt_3300K', 'warmweiß <3300 K', 0),
(62, 28, '105', '105 mm', 0),
(63, 29, '110', '110 mm', 0),
(64, 30, '80-89', '80-89', 0);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `backorders`
--

CREATE TABLE `backorders` (
  `id` int NOT NULL,
  `product_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `quantity` int NOT NULL,
  `expected_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `categories`
--

INSERT INTO `categories` (`id`, `slug`, `name`) VALUES
(1, 'led-band', 'LED-Band'),
(2, 'alu-profil', 'Alu-Profil'),
(3, 'einbaustrahler', 'Einbaustrahler'),
(4, 'leuchten', 'Leuchten'),
(5, 'schienensystem', 'Schienensystem'),
(6, 'aufbaustrahler', 'Aufbaustrahler'),
(7, 'trafo-dimmer', 'Trafo-Dimmer'),
(8, 'weihnachtsbeleuchtung', 'Weihnachtsbeleuchtung');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `customers`
--

CREATE TABLE `customers` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `company_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `approval_status` varchar(20) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pending',
  `activation_sent_at` datetime DEFAULT NULL,
  `activated_at` datetime DEFAULT NULL,
  `vat_number` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `company_register_no` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contact_person` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address_line1` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address_line2` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `country` char(2) COLLATE utf8mb4_general_ci DEFAULT 'AT',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `customers`
--

INSERT INTO `customers` (`id`, `user_id`, `company_name`, `approval_status`, `activation_sent_at`, `activated_at`, `vat_number`, `company_register_no`, `phone`, `contact_person`, `address_line1`, `address_line2`, `postal_code`, `city`, `country`, `created_at`) VALUES
(17, 30, 'Firma Test', 'active', '2025-08-26 07:10:14', '2025-08-26 07:11:25', 'ATU 123', 'FN 123', '123', 'Max', '44 Falsinsweg', NULL, '6533', 'Fiss', 'AT', '2025-08-26 07:07:03');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `customer_prices`
--

CREATE TABLE `customer_prices` (
  `id` int NOT NULL,
  `customer_id` int NOT NULL,
  `product_id` int NOT NULL,
  `special_price` decimal(10,2) NOT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `delivery_notes`
--

CREATE TABLE `delivery_notes` (
  `id` int NOT NULL,
  `order_id` int NOT NULL,
  `note_date` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `delivery_note_items`
--

CREATE TABLE `delivery_note_items` (
  `id` int NOT NULL,
  `delivery_note_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `documents`
--

CREATE TABLE `documents` (
  `id` int NOT NULL,
  `customer_id` int DEFAULT NULL,
  `type` enum('invoice','delivery_note','quote','other') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `file_url` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `hero_slides`
--

CREATE TABLE `hero_slides` (
  `id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `subtitle` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `hero_slides`
--

INSERT INTO `hero_slides` (`id`, `title`, `subtitle`, `image_url`, `sort_order`, `is_active`) VALUES
(1, 'Professionelle LED‑Beleuchtung', 'Hochwertige Lösungen für Geschäftskunden', '/uploads/hero-slides/slide1.jpg', 1, 1),
(2, 'Direkt vom Handel', 'Schnelle Verfügbarkeit & faire Konditionen', '/uploads/hero-slides/slide2.jpg', 2, 1);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `invoices`
--

CREATE TABLE `invoices` (
  `id` int NOT NULL,
  `order_id` int NOT NULL,
  `invoice_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `due_date` date DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` int NOT NULL,
  `invoice_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `orders`
--

CREATE TABLE `orders` (
  `id` int NOT NULL,
  `customer_id` int NOT NULL,
  `order_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','processing','shipped','completed','cancelled') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `total_amount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `order_items`
--

CREATE TABLE `order_items` (
  `id` int NOT NULL,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `token` varchar(128) NOT NULL,
  `type` enum('activation','reset') NOT NULL DEFAULT 'reset',
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Daten für Tabelle `password_resets`
--

INSERT INTO `password_resets` (`id`, `user_id`, `token`, `type`, `expires_at`, `used_at`, `created_at`) VALUES
(11, 30, '080faf0ee4cfb68feb56a3b85194a9ca1d7d6510da12df5e5104d0a19fd3afd4', 'activation', '2025-08-29 07:08:46', NULL, '2025-08-26 07:08:45');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `sku` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `category_slug` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `brand` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `price` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `stock_quantity` int DEFAULT '0',
  `tax_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `products`
--

INSERT INTO `products` (`id`, `sku`, `name`, `category_slug`, `brand`, `description`, `price`, `is_active`, `stock_quantity`, `tax_id`, `created_at`) VALUES
(13, 'LP-1001', 'LED Panel 30x30', 'leuchten', 'Lampadina', 'Hochwertiges LED Panel 30x30 cm, warmweiß 3000 K', 12.00, 1, 120, 13, '2025-08-14 13:50:04'),
(14, 'SP-2002', 'Spot GU10 5W', 'einbaustrahler', 'Lampadina', 'Energiespar-Spot GU10 5 W, 3000 K', 3.49, 1, 500, 13, '2025-08-14 13:50:04'),
(15, 'BL-3003', 'Wandleuchte IP54', 'leuchten', 'Lampadina', 'Outdoor‑Wandleuchte IP54, 556 lm, 3000 K', 49.00, 1, 60, 13, '2025-08-14 13:50:04'),
(16, 'LB-101', 'LED-Band 5m 3000K', 'led-band', 'Lampadina', 'Flexibles LED-Band, 5m, 3000K, 9.6W/m', 24.90, 1, 200, 13, '2025-08-19 12:04:21'),
(17, 'LB-102', 'LED-Band 5m 4000K', 'led-band', 'Lampadina', 'Flexibles LED-Band, 5m, 4000K, 9.6W/m', 24.90, 1, 180, 13, '2025-08-19 12:04:21'),
(18, 'AP-201', 'Alu-Profil 1m Einbau', 'alu-profil', 'Lampadina', 'Alu-Profil 1m für LED-Bänder, Einbau', 8.90, 1, 300, 13, '2025-08-19 12:04:21'),
(19, 'AP-202', 'Alu-Profil 2m Aufbau', 'alu-profil', 'Lampadina', 'Alu-Profil 2m für LED-Bänder, Aufbau', 15.90, 1, 150, 13, '2025-08-19 12:04:21'),
(20, 'ES-301', 'Einbaustrahler rund, weiß', 'einbaustrahler', 'Lampadina', 'Einbaustrahler rund, weiß, schwenkbar', 6.90, 1, 400, 13, '2025-08-19 12:04:21'),
(21, 'ES-302', 'Einbaustrahler eckig, anthrazit', 'einbaustrahler', 'Lampadina', 'Einbaustrahler eckig, anthrazit, schwenkbar', 7.90, 1, 350, 13, '2025-08-19 12:04:21'),
(22, 'LE-401', 'Pendelleuchte 120cm', 'leuchten', 'Lampadina', 'Schlanke Pendelleuchte 120cm, 4000K', 129.00, 1, 40, 13, '2025-08-19 12:04:21'),
(23, 'LE-402', 'Stehleuchte Dim to Warm', 'leuchten', 'Lampadina', 'Stehleuchte mit Dim‑to‑Warm 1800–3000K', 159.00, 1, 35, 13, '2025-08-19 12:04:21'),
(24, 'SS-501', '3‑Phasen Schiene 1m', 'schienensystem', 'Lampadina', '3‑Phasen Stromschiene 1m, schwarz', 19.90, 1, 120, 13, '2025-08-19 12:04:21'),
(25, 'SS-502', 'Strahler für 3‑Phasen', 'schienensystem', 'Lampadina', 'LED‑Strahler 20W für 3‑Phasen‑Schiene', 49.00, 1, 90, 13, '2025-08-19 12:04:21'),
(26, 'AS-601', 'Aufbaustrahler rund, weiß', 'aufbaustrahler', 'Lampadina', 'Aufbaustrahler rund, weiß, GU10', 12.90, 1, 220, 13, '2025-08-19 12:04:21'),
(27, 'AS-602', 'Aufbaustrahler eckig, schwarz', 'aufbaustrahler', 'Lampadina', 'Aufbaustrahler eckig, schwarz, GU10', 13.90, 1, 200, 13, '2025-08-19 12:04:21'),
(28, 'TD-701', 'LED‑Trafo 24V 60W', 'trafo-dimmer', 'Lampadina', 'Netzteil 24V, 60W, slim', 22.50, 1, 160, 13, '2025-08-19 12:04:21'),
(29, 'TD-702', 'Phasenabschnitt‑Dimmer', 'trafo-dimmer', 'Lampadina', 'Wanddimmer, Phasenabschnitt, 3‑300W', 29.90, 1, 80, 13, '2025-08-19 12:04:21'),
(30, 'WB-801', 'Lichterkette 10m warmweiß', 'weihnachtsbeleuchtung', 'Lampadina', 'IP44 Lichterkette 10m, warmweiß', 19.90, 1, 140, 13, '2025-08-19 12:04:21'),
(31, 'WB-802', 'LED‑Eiszapfen 5m', 'weihnachtsbeleuchtung', 'Lampadina', 'Außenbereich Eiszapfen, 5m', 24.90, 1, 120, 13, '2025-08-19 12:04:21');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `product_attributes`
--

CREATE TABLE `product_attributes` (
  `id` int NOT NULL,
  `product_id` int NOT NULL,
  `attribute_id` int NOT NULL,
  `option_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `product_attributes`
--

INSERT INTO `product_attributes` (`id`, `product_id`, `attribute_id`, `option_id`) VALUES
(13, 13, 5, 12),
(14, 13, 6, 15),
(15, 14, 6, 14),
(16, 15, 5, 11),
(17, 15, 6, 13),
(18, 15, 7, 46),
(19, 15, 10, 35),
(20, 15, 11, 49);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `product_images`
--

CREATE TABLE `product_images` (
  `id` int NOT NULL,
  `product_id` int NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_url`, `is_primary`, `sort_order`) VALUES
(13, 13, '/uploads/products/demo/panel_30x30.jpg', 1, 1),
(14, 14, '/uploads/products/demo/spot_gu10.jpg', 1, 1),
(15, 15, '/uploads/products/demo/wandleuchte.jpg', 1, 1),
(16, 16, '/uploads/products/demo/ledband_3000k.jpg', 1, 1),
(17, 17, '/uploads/products/demo/ledband_4000k.jpg', 1, 1),
(18, 18, '/uploads/products/demo/aluprofil_1m.jpg', 1, 1),
(19, 19, '/uploads/products/demo/aluprofil_2m.jpg', 1, 1),
(20, 15, '/uploads/products/demo/wandleuchte.jpg', 1, 1);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `quotes`
--

CREATE TABLE `quotes` (
  `id` int NOT NULL,
  `customer_id` int NOT NULL,
  `quote_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `valid_until` date DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `quote_items`
--

CREATE TABLE `quote_items` (
  `id` int NOT NULL,
  `quote_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `returns`
--

CREATE TABLE `returns` (
  `id` int NOT NULL,
  `order_id` int NOT NULL,
  `return_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `reason` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `return_items`
--

CREATE TABLE `return_items` (
  `id` int NOT NULL,
  `return_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `taxes`
--

CREATE TABLE `taxes` (
  `id` int NOT NULL,
  `country` char(2) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'AT',
  `name` varchar(128) COLLATE utf8mb4_general_ci NOT NULL,
  `rate_pct` decimal(5,2) NOT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `taxes`
--

INSERT INTO `taxes` (`id`, `country`, `name`, `rate_pct`, `valid_from`, `valid_until`, `created_at`) VALUES
(13, 'AT', 'USt Standard', 20.00, '2020-01-01', NULL, '2025-08-14 13:50:04');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('admin','user') COLLATE utf8mb4_general_ci DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `role`, `created_at`) VALUES
(3, 'admin@lampadina.icu', '$2b$10$gwsvBpdahkDkOE3IZT8leu6WJtj6nAStmz.8X2Zg8/lOrArZEMnIa', 'admin', '2025-08-14 14:11:59'),
(30, 'mc_chrisi@hotmail.com', '$2a$10$y29aE.ysesWtIuCEdaECo.NwBTd.rS9GYduZ.lm6JwqkWqGS.6Sz.', 'user', '2025-08-26 07:07:03');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `attributes`
--
ALTER TABLE `attributes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indizes für die Tabelle `attribute_options`
--
ALTER TABLE `attribute_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attribute_id` (`attribute_id`);

--
-- Indizes für die Tabelle `backorders`
--
ALTER TABLE `backorders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indizes für die Tabelle `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_categories_slug` (`slug`);

--
-- Indizes für die Tabelle `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indizes für die Tabelle `customer_prices`
--
ALTER TABLE `customer_prices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indizes für die Tabelle `delivery_notes`
--
ALTER TABLE `delivery_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indizes für die Tabelle `delivery_note_items`
--
ALTER TABLE `delivery_note_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `delivery_note_id` (`delivery_note_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indizes für die Tabelle `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indizes für die Tabelle `hero_slides`
--
ALTER TABLE `hero_slides`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indizes für die Tabelle `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_id` (`invoice_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indizes für die Tabelle `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indizes für die Tabelle `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indizes für die Tabelle `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_password_resets_token` (`token`),
  ADD KEY `fk_passwordresets_user` (`user_id`);

--
-- Indizes für die Tabelle `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `tax_id` (`tax_id`),
  ADD KEY `idx_products_category` (`category_slug`),
  ADD KEY `idx_products_brand` (`brand`),
  ADD KEY `idx_products_active` (`is_active`);

--
-- Indizes für die Tabelle `product_attributes`
--
ALTER TABLE `product_attributes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `attribute_id` (`attribute_id`),
  ADD KEY `option_id` (`option_id`);

--
-- Indizes für die Tabelle `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_primary` (`product_id`,`is_primary`,`sort_order`);

--
-- Indizes für die Tabelle `quotes`
--
ALTER TABLE `quotes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indizes für die Tabelle `quote_items`
--
ALTER TABLE `quote_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quote_id` (`quote_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indizes für die Tabelle `returns`
--
ALTER TABLE `returns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indizes für die Tabelle `return_items`
--
ALTER TABLE `return_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `return_id` (`return_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indizes für die Tabelle `taxes`
--
ALTER TABLE `taxes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tax` (`country`,`name`,`rate_pct`,`valid_from`);

--
-- Indizes für die Tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `attributes`
--
ALTER TABLE `attributes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT für Tabelle `attribute_options`
--
ALTER TABLE `attribute_options`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT für Tabelle `backorders`
--
ALTER TABLE `backorders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT für Tabelle `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT für Tabelle `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT für Tabelle `customer_prices`
--
ALTER TABLE `customer_prices`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT für Tabelle `delivery_notes`
--
ALTER TABLE `delivery_notes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT für Tabelle `delivery_note_items`
--
ALTER TABLE `delivery_note_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT für Tabelle `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT für Tabelle `hero_slides`
--
ALTER TABLE `hero_slides`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT für Tabelle `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT für Tabelle `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT für Tabelle `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT für Tabelle `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT für Tabelle `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT für Tabelle `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT für Tabelle `product_attributes`
--
ALTER TABLE `product_attributes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT für Tabelle `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT für Tabelle `quotes`
--
ALTER TABLE `quotes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT für Tabelle `quote_items`
--
ALTER TABLE `quote_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT für Tabelle `returns`
--
ALTER TABLE `returns`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT für Tabelle `return_items`
--
ALTER TABLE `return_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT für Tabelle `taxes`
--
ALTER TABLE `taxes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT für Tabelle `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `attribute_options`
--
ALTER TABLE `attribute_options`
  ADD CONSTRAINT `attribute_options_ibfk_1` FOREIGN KEY (`attribute_id`) REFERENCES `attributes` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `backorders`
--
ALTER TABLE `backorders`
  ADD CONSTRAINT `backorders_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `backorders_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

--
-- Constraints der Tabelle `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `customer_prices`
--
ALTER TABLE `customer_prices`
  ADD CONSTRAINT `customer_prices_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `customer_prices_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `delivery_notes`
--
ALTER TABLE `delivery_notes`
  ADD CONSTRAINT `delivery_notes_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `delivery_note_items`
--
ALTER TABLE `delivery_note_items`
  ADD CONSTRAINT `delivery_note_items_ibfk_1` FOREIGN KEY (`delivery_note_id`) REFERENCES `delivery_notes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `delivery_note_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints der Tabelle `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoice_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints der Tabelle `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints der Tabelle `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `fk_passwordresets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`tax_id`) REFERENCES `taxes` (`id`);

--
-- Constraints der Tabelle `product_attributes`
--
ALTER TABLE `product_attributes`
  ADD CONSTRAINT `product_attributes_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_attributes_ibfk_2` FOREIGN KEY (`attribute_id`) REFERENCES `attributes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_attributes_ibfk_3` FOREIGN KEY (`option_id`) REFERENCES `attribute_options` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `quotes`
--
ALTER TABLE `quotes`
  ADD CONSTRAINT `quotes_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `quote_items`
--
ALTER TABLE `quote_items`
  ADD CONSTRAINT `quote_items_ibfk_1` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quote_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints der Tabelle `returns`
--
ALTER TABLE `returns`
  ADD CONSTRAINT `returns_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `return_items`
--
ALTER TABLE `return_items`
  ADD CONSTRAINT `return_items_ibfk_1` FOREIGN KEY (`return_id`) REFERENCES `returns` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `return_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
