-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 10, 2023 at 12:34 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dbreviewtas`
--

-- --------------------------------------------------------

--
-- Table structure for table `account`
--

CREATE TABLE `account` (
  `Id_Account` int(10) NOT NULL AUTO_INCREMENT,
  `Username` varchar(30) NOT NULL,
  `Password` varchar(10) NOT NULL,
  `E_mail` varchar(40) NOT NULL,
  `Nama_Lengkap` varchar(50) NOT NULL,
  `IsAdmin` bit(1) NOT NULL,
  PRIMARY KEY (`Id_Account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `account`
--

INSERT INTO `account` (`Username`, `Password`, `E_mail`, `Nama_Lengkap`, `IsAdmin`) VALUES
('admin', 'admin', 'admin@BagsForYou@gma', 'Admin', b'1'),
('RalvinA12', 'ralvina121', 'RalvinA12@gmail.com', 'Ralvin Adrian', b'0'),
('AlvynA33', 'alvyna3322', 'AlvynA33@gmail.com', 'Alvyn Antonius', b'0'),
('SammyG12', 'SammyG51', 'SammyG@gmail.com', 'Sammy Gunawan', b'0'),
('Lyodra51', 'LyodraA51', 'LyodraA@gmail.com', 'Lyodra Anggita', b'0'),
('JohnDoe123', 'JohnDoe456', 'johndoe@gmail.com', 'John Doe', b'0'),
('SarahSmith89', 'SarahSmith', 'sarahsmith@gmail.com', 'Sarah Smith', b'0'),
('MikeJohnson22', 'MikeJ5678', 'mikejohnson@gmail.com', 'Mike Johnson', b'0'),
('EmilyDavis44', 'EmilyDavis', 'emilydavis@gmail.com', 'Emily Davis', b'0'),
('DavidBrown55', 'DavidB2023', 'davidbrown@gmail.com', 'David Brown', b'0'),
('EmmaTaylor77', 'EmmaT1234', 'emmataylor@gmail.com', 'Emma Taylor', b'0'),
('JasonLee12', 'JasonL4567', 'jasonlee@gmail.com', 'Jason Lee', b'0'),
('SophiaWright33', 'SophiaW123', 'sophiawright@gmail.com', 'Sophia Wright', b'0');

-- --------------------------------------------------------

--
-- Table structure for table `designer`
--

CREATE TABLE `designer` (
  `Id_Designer` int(10) NOT NULL AUTO_INCREMENT,
  `Nama_Designer` varchar(50) NOT NULL,
  PRIMARY KEY (`Id_Designer`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `designer`
--

INSERT INTO `designer` (`Nama_Designer`) VALUES
('Kate Spade'),
('Timbuk2'),
('Coach'),
('Michael Kors'),
('Fjallraven'),
('Samsonite'),
('The North Face'),
('Herschel'),
('Gucci'),
('Patagonia'),
('Jansport'),
('Chanel'),
('Under Armour'),
('Longchamp'),
('Versace'),
('Puma'),
('Prada'),
('Oakley');

-- --------------------------------------------------------

--
-- Table structure for table `follow`
--

CREATE TABLE `follow` (
  `Id_Account` int(10) NOT NULL,
  `Id_Follower` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kategori`
--

CREATE TABLE `kategori` (
  `Id_Kategori` int(10) NOT NULL AUTO_INCREMENT,
  `Nama_Kategori` varchar(50) NOT NULL,
  PRIMARY KEY (`Id_Kategori`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kategori`
--

INSERT INTO `kategori` (`Nama_Kategori`) VALUES
('Backpack'),
('Tote'),
('Messenger'),
('Duffel'),
('Satchel'),
('Clutch'),
('Crossbody'),
('Briefcase'),
('Waist Pack');

-- --------------------------------------------------------

--
-- Table structure for table `merk`
--

CREATE TABLE `merk` (
  `Id_Merk` int(10) NOT NULL AUTO_INCREMENT,
  `Nama_Merk` varchar(50) NOT NULL,
  PRIMARY KEY (`Id_Merk`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `merk`
--

INSERT INTO `merk` (`Nama_Merk`) VALUES
('Adidas'),
('Kate Spade'),
('Timbuk2'),
('Nike'),
('Coach'),
('Michael Kors'),
('Fjallraven'),
('Samsonite'),
('North Face'),
('Herschel'),
('Gucci'),
('Patagonia'),
('Jansport'),
('Chanel'),
('Under Armour'),
('Longchamp'),
('Versace'),
('Puma'),
('Prada'),
('Oakley');

-- --------------------------------------------------------

--
-- Table structure for table `review`
--

CREATE TABLE `review` (
  `Id_Review` int(10) NOT NULL AUTO_INCREMENT,
  `Isi_Review` varchar(500) NOT NULL,
  `Bintang` int(1) NOT NULL,
  `Tanggal_Review` date NOT NULL,
  `Id_Account` int(10) NOT NULL,
  `Id_Tas` int(10) NOT NULL,
  PRIMARY KEY (`Id_Review`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sub_kategori`
--

CREATE TABLE `sub_kategori` (
  `Id_Subkategori` int(10) NOT NULL AUTO_INCREMENT,
  `Nama_Subkategori` varchar(50) NOT NULL,
  `Id_Kategori` int(10) NOT NULL,
  PRIMARY KEY (`Id_Subkategori`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sub_kategori`
--

INSERT INTO `sub_kategori` (`Nama_Subkategori`, `Id_Kategori`) VALUES
('Travel', 1),
('Everyday', 2),
('Work', 3),
('Gym', 4),
('Formal', 5),
('Evening', 6),
('Casual', 7),
('Business', 8),
('Outdoor', 9),
('School', 1),
('Beach', 2),
('Bike', 3),
('Hiking', 4),
('Party', 5),
('Team Sports', 6),
('Travel', 7),
('Luxury', 8),
('Sports', 9),
('Luxury', 1),
('Outdoor', 2);

-- --------------------------------------------------------

--
-- Table structure for table `tas`
--

CREATE TABLE `tas` (
  `Id_Tas` int(10) NOT NULL AUTO_INCREMENT,
  `namaTas` varchar(100) NOT NULL,
  `Deskripsi` varchar(500) NOT NULL,
  `Warna` varchar(20) NOT NULL,
  `Dimensi` varchar(50) NOT NULL,
  `Id_Merk` int(10) NOT NULL,
  `Id_Designer` int(10) DEFAULT NULL,
  `Id_Subkategori` int(10) NOT NULL,
  PRIMARY KEY (`Id_Tas`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tas`
--

INSERT INTO `tas` (`namaTas`, `Deskripsi`, `Warna`, `Dimensi`, `Id_Merk`, `Id_Designer`, `Id_Subkategori`) VALUES
('Adidas Backpack', 'The Adidas backpack is perfect for everyday use.', 'Black', '16\" x 12\" x 6\"', 1, NULL, 1),
('Kate Spade Tote', 'The Kate Spade tote is a stylish and spacious bag for work and travel.', 'Navy', '18\" x 12\" x 6\"', 2, 1, 2),
('Timbuk2 Messenger', 'The Timbuk2 messenger bag is designed for bike commuters.', 'Gray', '14\" x 10\" x 5\"', 3, 2, 3),
('Nike Duffel', 'The Nike duffel bag is perfect for gym and sports activities.', 'Red', '20\" x 10\" x 10\"', 4, NULL, 4),
('Coach Satchel', 'The Coach satchel is a sophisticated choice for formal occasions.', 'Brown', '12\" x 9\" x 4\"', 5, 3, 5),
('Michael Kors Clutch', 'The Michael Kors clutch is a stylish accessory for evening events.', 'Gold', '10\" x 6\" x 2\"', 6, 4, 6),
('Fjallraven Backpack', 'The Fjallraven backpack is durable and ideal for outdoor adventures.', 'Green', '18\" x 13\" x 6\"', 7, 5, 7),
('Samsonite Briefcase', 'The Samsonite briefcase is perfect for business professionals.', 'Black', '16\" x 12\" x 4\"', 8, 6, 8),
('North Face Waist Pack', 'The North Face waist pack is great for outdoor activities.', 'Blue', '10\" x 5\" x 3\"', 9, 7, 9),
('Herschel Backpack', 'The Herschel backpack is versatile and suitable for school or travel.', 'Gray', '17\" x 12\" x 5\"', 10, 8, 1),
('Gucci Tote', 'The Gucci tote is a luxury bag for those who appreciate high-end fashion.', 'Black', '16\" x 14\" x 6\"', 11, 9, 2),
('Patagonia Messenger', 'The Patagonia messenger bag is durable and perfect for outdoor enthusiasts.', 'Green', '15\" x 11\" x 4\"', 12, 10, 3),
('Jansport Backpack', 'The Jansport backpack is a classic choice for students and travelers.', 'Blue', '18\" x 14\" x 7\"', 13, 11, 4),
('Chanel Clutch', 'The Chanel clutch is an elegant accessory for special occasions.', 'Black', '9\" x 5\" x 2\"', 14, 12, 5),
('Under Armour Crossbody', 'The Under Armour crossbody bag is perfect for active individuals.', 'Gray', '10\" x 8\" x 3\"', 15, 13, 6),
('Longchamp Travel Bag', 'The Longchamp travel bag is spacious and ideal for trips.', 'Navy', '20\" x 16\" x 8\"', 16, 14, 7),
('Versace Luxury Bag', 'The Versace luxury bag is a statement piece for fashion enthusiasts.', 'Red', '14\" x 12\" x 6\"', 17, 15, 8),
('Puma Sports Backpack', 'The Puma sports backpack is designed for athletes.', 'Black', '18\" x 13\" x 7\"', 18, 16, 9),
('Prada Outdoor Backpack', 'The Prada outdoor backpack is both stylish and functional.', 'Gray', '16\" x 11\" x 5\"', 19, 17, 1),
('Oakley Backpack', 'The Oakley backpack is rugged and suitable for outdoor adventures.', 'Green', '19\" x 15\" x 8\"', 20, 18, 2);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account`
--
-- ALTER TABLE `account`
--   ADD PRIMARY KEY (`Id_Account`);

--
-- Indexes for table `designer`
--
-- ALTER TABLE `designer`
--   ADD PRIMARY KEY (`Id_Designer`);

--
-- Indexes for table `follow`
--
ALTER TABLE `follow`
  ADD PRIMARY KEY (`Id_Account`),
  ADD KEY `follow_account` (`Id_Follower`);

--
-- Indexes for table `kategori`
--
-- ALTER TABLE `kategori`
--   ADD PRIMARY KEY (`Id_Kategori`);

--
-- Indexes for table `merk`
--
-- ALTER TABLE `merk`
--   ADD PRIMARY KEY (`Id_Merk`);

--
-- Indexes for table `review`
--
-- ALTER TABLE `review`
--   ADD PRIMARY KEY (`Id_Review`);

--
-- Indexes for table `sub_kategori`
--
ALTER TABLE `sub_kategori`
  -- ADD PRIMARY KEY (`Id_Subkategori`),
  ADD KEY `sub_kategori_kategori` (`Id_Kategori`);

--
-- Indexes for table `tas`
--
ALTER TABLE `tas`
  -- ADD PRIMARY KEY (`Id_Tas`),
  ADD KEY `tas_subkategori` (`Id_Subkategori`),
  ADD KEY `tas_merk` (`Id_Merk`),
  ADD KEY `tas_designer` (`Id_Designer`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `follow`
--
ALTER TABLE `follow`
  ADD CONSTRAINT `follow_account` FOREIGN KEY (`Id_Follower`) REFERENCES `account` (`Id_Account`);

--
-- Constraints for table `sub_kategori`
--
ALTER TABLE `sub_kategori`
  ADD CONSTRAINT `sub_kategori_kategori` FOREIGN KEY (`Id_Kategori`) REFERENCES `kategori` (`Id_Kategori`);

--
-- Constraints for table `tas`
--
ALTER TABLE `tas`
  ADD CONSTRAINT `tas_designer` FOREIGN KEY (`Id_Designer`) REFERENCES `designer` (`Id_Designer`),
  ADD CONSTRAINT `tas_merk` FOREIGN KEY (`Id_Merk`) REFERENCES `merk` (`Id_Merk`),
  ADD CONSTRAINT `tas_subkategori` FOREIGN KEY (`Id_Subkategori`) REFERENCES `sub_kategori` (`Id_Subkategori`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
