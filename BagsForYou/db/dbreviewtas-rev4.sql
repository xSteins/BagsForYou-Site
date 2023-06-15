-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 14, 2023 at 02:44 PM
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
  `Id_Account` int(10) NOT NULL,
  `Username` varchar(30) NOT NULL,
  `Password` varchar(40) NOT NULL,
  `E_mail` varchar(40) NOT NULL,
  `Nama_Lengkap` varchar(50) NOT NULL,
  `IsAdmin` bit(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `account`
--

INSERT INTO `account` (`Id_Account`, `Username`, `Password`, `E_mail`, `Nama_Lengkap`, `IsAdmin`) VALUES
(1, 'admin', 'admin', 'admin@bagsforyou.com', 'Admin', b'1'),
(2, 'RalvinA', 'passwOrd', 'RalvinA12@gmail.com', 'Ralvin Adrian', b'0'),
(3, 'AlvynA33', 'alvyna3322', 'AlvynA33@gmail.com', 'Alvyn Antonius', b'0'),
(4, 'SammyG12', 'SammyG51', 'SammyG@gmail.com', 'Sammy Gunawan', b'0'),
(5, 'Lyodra51', 'LyodraA51', 'LyodraA@gmail.com', 'Lyodra Anggita', b'0'),
(6, 'JohnDoe123', 'JohnDoe456', 'johndoe@gmail.com', 'John Doe', b'0'),
(7, 'SarahSmith89', 'SarahSmith', 'sarahsmith@gmail.com', 'Sarah Smith', b'0'),
(8, 'MikeJohnson22', 'MikeJ5678', 'mikejohnson@gmail.com', 'Mike Johnson', b'0'),
(9, 'EmilyDavis44', 'EmilyDavis', 'emilydavis@gmail.com', 'Emily Davis', b'0'),
(10, 'DavidBrown55', 'DavidB2023', 'davidbrown@gmail.com', 'David Brown', b'0'),
(11, 'EmmaTaylor77', 'EmmaT1234', 'emmataylor@gmail.com', 'Emma Taylor', b'0'),
(12, 'JasonLee12', 'JasonL4567', 'jasonlee@gmail.com', 'Jason Lee', b'0'),
(13, 'SophiaWright33', 'SophiaW123', 'sophiawright@gmail.com', 'Sophia Wright', b'0'),
(14, 'Tes-username', '9?._LeMG!;eu6DE', 'example@example.com', 'akun baru lagi', b'0');

-- --------------------------------------------------------

--
-- Table structure for table `designer`
--

CREATE TABLE `designer` (
  `Id_Designer` int(10) NOT NULL,
  `Nama_Designer` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `designer`
--

INSERT INTO `designer` (`Id_Designer`, `Nama_Designer`) VALUES
(1, 'Kate Spade'),
(2, 'Timbuk2'),
(3, 'Coach'),
(4, 'Michael Kors'),
(5, 'Fjallraven'),
(6, 'Samsonite'),
(7, 'The North Face'),
(8, 'Herschel'),
(9, 'Gucci'),
(10, 'Patagonia'),
(11, 'Jansport'),
(12, 'Chanel'),
(13, 'Under Armour'),
(14, 'Longchamp'),
(15, 'Versace'),
(16, 'Puma'),
(17, 'Prada'),
(18, 'Oakley');

-- --------------------------------------------------------

--
-- Table structure for table `follow`
--

CREATE TABLE `follow` (
  `Id_Account` int(10) NOT NULL,
  `Id_Follower` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `follow`
--

INSERT INTO `follow` (`Id_Account`, `Id_Follower`) VALUES
(1, 2),
(1, 3),
(1, 4),
(2, 1),
(2, 5),
(3, 1),
(3, 4),
(4, 2),
(4, 3),
(5, 1),
(5, 3),
(6, 1),
(6, 2),
(7, 1),
(8, 2),
(8, 3),
(9, 1),
(9, 4),
(10, 2),
(10, 3);

-- --------------------------------------------------------

--
-- Table structure for table `kategori`
--

CREATE TABLE `kategori` (
  `Id_Kategori` int(10) NOT NULL,
  `Nama_Kategori` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kategori`
--

INSERT INTO `kategori` (`Id_Kategori`, `Nama_Kategori`) VALUES
(1, 'Backpack'),
(2, 'Tote'),
(3, 'Messenger'),
(4, 'Duffel'),
(5, 'Satchel'),
(6, 'Clutch'),
(7, 'Crossbody'),
(8, 'Briefcase'),
(9, 'Waist Pack');

-- --------------------------------------------------------

--
-- Table structure for table `merk`
--

CREATE TABLE `merk` (
  `Id_Merk` int(10) NOT NULL,
  `Nama_Merk` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `merk`
--

INSERT INTO `merk` (`Id_Merk`, `Nama_Merk`) VALUES
(1, 'Adidas'),
(2, 'Kate Spade'),
(3, 'Timbuk2'),
(4, 'Nike'),
(5, 'Coach'),
(6, 'Michael Kors'),
(7, 'Fjallraven'),
(8, 'Samsonite'),
(9, 'North Face'),
(10, 'Herschel'),
(11, 'Gucci'),
(12, 'Patagonia'),
(13, 'Jansport'),
(14, 'Chanel'),
(15, 'Under Armour'),
(16, 'Longchamp'),
(17, 'Versace'),
(18, 'Puma'),
(19, 'Prada'),
(20, 'Oakley');

-- --------------------------------------------------------

--
-- Table structure for table `review`
--

CREATE TABLE `review` (
  `Id_Review` int(10) NOT NULL,
  `Isi_Review` varchar(500) NOT NULL,
  `Bintang` int(1) NOT NULL,
  `Tanggal_Review` date NOT NULL,
  `Id_Account` int(10) NOT NULL,
  `Id_Tas` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `review`
--

INSERT INTO `review` (`Id_Review`, `Isi_Review`, `Bintang`, `Tanggal_Review`, `Id_Account`, `Id_Tas`) VALUES
(1, 'Great bag!', 5, '2023-06-13', 1, 1),
(2, 'Excellent quality!', 4, '2023-06-13', 2, 1),
(3, 'Highly recommended!', 5, '2023-06-13', 3, 2),
(4, 'Love this bag!', 4, '2023-06-13', 4, 2),
(5, 'Perfect for everyday use.', 5, '2023-06-13', 5, 3),
(6, 'Very stylish design.', 4, '2023-06-13', 6, 3),
(7, 'Good value for money.', 3, '2023-06-13', 7, 4),
(8, 'Nice color options.', 4, '2023-06-13', 8, 4),
(9, 'Comfortable to carry.', 5, '2023-06-13', 9, 5),
(10, 'Durable material.', 4, '2023-06-13', 10, 5),
(11, 'Spacious and practical.', 5, '2023-06-13', 11, 6),
(12, 'Great for travel.', 4, '2023-06-13', 12, 6),
(13, 'Well-made and sturdy.', 5, '2023-06-13', 13, 7),
(14, 'Good organization compartments.', 4, '2023-06-13', 14, 7),
(15, 'Beautiful craftsmanship.', 5, '2023-06-13', 15, 8),
(16, 'Received many compliments.', 4, '2023-06-13', 16, 8),
(17, 'Lightweight and practical.', 5, '2023-06-13', 17, 9),
(18, 'High-quality leather.', 4, '2023-06-13', 18, 9),
(19, 'Great customer service.', 5, '2023-06-13', 19, 10),
(20, 'Fast shipping.', 4, '2023-06-13', 20, 10),
(21, 'Nice design!', 3, '2023-06-13', 1, 11),
(22, 'Average quality.', 2, '2023-06-13', 2, 11),
(23, 'Decent bag.', 3, '2023-06-13', 3, 12),
(24, 'Not worth the price.', 2, '2023-06-13', 4, 12),
(25, 'Functional and simple.', 4, '2023-06-13', 5, 13),
(26, 'Lacks durability.', 2, '2023-06-13', 6, 13),
(27, 'Unique design.', 5, '2023-06-13', 7, 14),
(28, 'Uncomfortable straps.', 2, '2023-06-13', 8, 14),
(29, 'Good size for daily use.', 4, '2023-06-13', 9, 15),
(30, 'Poor stitching.', 2, '2023-06-13', 10, 15),
(31, 'Sturdy construction.', 5, '2023-06-13', 11, 16),
(32, 'Overpriced.', 3, '2023-06-13', 12, 16),
(33, 'Great color options.', 4, '2023-06-13', 13, 17),
(34, 'Lacks organization.', 3, '2023-06-13', 14, 17),
(35, 'Good for work.', 4, '2023-06-13', 15, 18),
(36, 'Poor zipper quality.', 2, '2023-06-13', 16, 18),
(37, 'Sleek and modern.', 5, '2023-06-13', 17, 19),
(38, 'Not enough compartments.', 3, '2023-06-13', 18, 19),
(39, 'Excellent customer support.', 5, '2023-06-13', 19, 20),
(40, 'Delayed delivery.', 2, '2023-06-13', 20, 20);

-- --------------------------------------------------------

--
-- Table structure for table `sub_kategori`
--

CREATE TABLE `sub_kategori` (
  `Id_Subkategori` int(10) NOT NULL,
  `Nama_Subkategori` varchar(50) NOT NULL,
  `Id_Kategori` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sub_kategori`
--

INSERT INTO `sub_kategori` (`Id_Subkategori`, `Nama_Subkategori`, `Id_Kategori`) VALUES
(1, 'Travel', 1),
(2, 'Everyday', 2),
(3, 'Work', 3),
(4, 'Gym', 4),
(5, 'Formal', 5),
(6, 'Evening', 6),
(7, 'Casual', 7),
(8, 'Business', 8),
(9, 'Outdoor', 9),
(10, 'School', 1),
(11, 'Beach', 2),
(12, 'Bike', 3),
(13, 'Hiking', 4),
(14, 'Party', 5),
(15, 'Team Sports', 6),
(16, 'Travel', 7),
(17, 'Luxury', 8),
(18, 'Sports', 9),
(19, 'Luxury', 1),
(20, 'Outdoor', 2);

-- --------------------------------------------------------

--
-- Table structure for table `tas`
--

CREATE TABLE `tas` (
  `Id_Tas` int(10) NOT NULL,
  `namaTas` varchar(100) NOT NULL,
  `Deskripsi` varchar(500) NOT NULL,
  `Warna` varchar(20) NOT NULL,
  `Dimensi` varchar(50) NOT NULL,
  `Id_Merk` int(10) NOT NULL,
  `Id_Designer` int(10) DEFAULT NULL,
  `Id_Subkategori` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tas`
--

INSERT INTO `tas` (`Id_Tas`, `namaTas`, `Deskripsi`, `Warna`, `Dimensi`, `Id_Merk`, `Id_Designer`, `Id_Subkategori`) VALUES
(1, 'Adidas Backpack', 'The Adidas backpack is perfect for everyday use.', 'Black', '16\" x 12\" x 6\"', 1, NULL, 1),
(2, 'Kate Spade Tote', 'The Kate Spade tote is a stylish and spacious bag for work and travel.', 'Navy', '18\" x 12\" x 6\"', 2, 1, 2),
(3, 'Timbuk2 Messenger', 'The Timbuk2 messenger bag is designed for bike commuters.', 'Gray', '14\" x 10\" x 5\"', 3, 2, 3),
(4, 'Nike Duffel', 'The Nike duffel bag is perfect for gym and sports activities.', 'Red', '20\" x 10\" x 10\"', 4, NULL, 4),
(5, 'Coach Satchel', 'The Coach satchel is a sophisticated choice for formal occasions.', 'Brown', '12\" x 9\" x 4\"', 5, 3, 5),
(6, 'Michael Kors Clutch', 'The Michael Kors clutch is a stylish accessory for evening events.', 'Gold', '10\" x 6\" x 2\"', 6, 4, 6),
(7, 'Fjallraven Backpack', 'The Fjallraven backpack is durable and ideal for outdoor adventures.', 'Green', '18\" x 13\" x 6\"', 7, 5, 7),
(8, 'Samsonite Briefcase', 'The Samsonite briefcase is perfect for business professionals.', 'Black', '16\" x 12\" x 4\"', 8, 6, 8),
(9, 'North Face Waist Pack', 'The North Face waist pack is great for outdoor activities.', 'Blue', '10\" x 5\" x 3\"', 9, 7, 9),
(10, 'Herschel Backpack', 'The Herschel backpack is versatile and suitable for school or travel.', 'Gray', '17\" x 12\" x 5\"', 10, 8, 1),
(11, 'Gucci Tote', 'The Gucci tote is a luxury bag for those who appreciate high-end fashion.', 'Black', '16\" x 14\" x 6\"', 11, 9, 2),
(12, 'Patagonia Messenger', 'The Patagonia messenger bag is durable and perfect for outdoor enthusiasts.', 'Green', '15\" x 11\" x 4\"', 12, 10, 3),
(13, 'Jansport Backpack', 'The Jansport backpack is a classic choice for students and travelers.', 'Blue', '18\" x 14\" x 7\"', 13, 11, 4),
(14, 'Chanel Clutch', 'The Chanel clutch is an elegant accessory for special occasions.', 'Black', '9\" x 5\" x 2\"', 14, 12, 5),
(15, 'Under Armour Crossbody', 'The Under Armour crossbody bag is perfect for active individuals.', 'Gray', '10\" x 8\" x 3\"', 15, 13, 6),
(16, 'Longchamp Travel Bag', 'The Longchamp travel bag is spacious and ideal for trips.', 'Navy', '20\" x 16\" x 8\"', 16, 14, 7),
(17, 'Versace Luxury Bag', 'The Versace luxury bag is a statement piece for fashion enthusiasts.', 'Red', '14\" x 12\" x 6\"', 17, 15, 8),
(18, 'Puma Sports Backpack', 'The Puma sports backpack is designed for athletes.', 'Black', '18\" x 13\" x 7\"', 18, 16, 9),
(19, 'Prada Outdoor Backpack', 'The Prada outdoor backpack is both stylish and functional.', 'Gray', '16\" x 11\" x 5\"', 19, 17, 1),
(20, 'Oakley Backpack', 'The Oakley backpack is rugged and suitable for outdoor adventures.', 'Green', '19\" x 15\" x 8\"', 20, 18, 2),
(21, 'Tommy Hilfiger Casual Tote Bag', 'The Tommy Hilfiger Casual Tote Bag is a stylish and practical accessory. It features the brand\'s signature logo and sturdy handles.', 'Black', '15\" x 12\" x 5\"', 1, 8, 7),
(22, 'Calvin Klein Evening Clutch', 'The Calvin Klein Evening Clutch is a sleek and elegant bag for formal events. It has a compact size and a polished metal closure.', 'Black', '9\" x 5\" x 2\"', 2, 9, 6),
(23, 'Guess Designer Crossbody Bag', 'The Guess Designer Crossbody Bag is a trendy and fashionable accessory. It features a unique design and adjustable chain strap.', 'Red', '10\" x 8\" x 3\"', 3, 10, 17),
(24, 'Ralph Lauren Luxury Backpack', 'The Ralph Lauren Luxury Backpack is a premium accessory made from fine materials. It combines style and functionality for a sophisticated look.', 'Brown', '17\" x 12\" x 5\"', 5, 12, 1),
(25, 'Dior Saddle Shoulder Bag', 'The Dior Saddle Shoulder Bag is a fashion-forward accessory with a signature curved shape. It\'s crafted from high-quality materials and has a unique charm.', 'Black', '12\" x 9\" x 4\"', 6, 13, 6),
(26, 'Balenciaga Oversized Tote Bag', 'The Balenciaga Oversized Tote Bag is a statement piece with a spacious interior. It\'s made from premium materials and features the brand\'s iconic logo.', 'Gray', '18\" x 16\" x 7\"', 7, 14, 2),
(27, 'Burberry Leather Crossbody Bag', 'The Burberry Leather Crossbody Bag is a luxurious accessory made from supple leather. It has a compact size and a versatile adjustable strap.', 'Tan', '12\" x 10\" x 4\"', 9, 16, 7),
(28, 'Salvatore Ferragamo Luxury Satchel', 'The Salvatore Ferragamo Luxury Satchel is a sophisticated and elegant bag. It\'s crafted from premium materials and features the brand\'s iconic logo.', 'Black', '14\" x 12\" x 6\"', 10, 17, 5);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`Id_Account`);

--
-- Indexes for table `designer`
--
ALTER TABLE `designer`
  ADD PRIMARY KEY (`Id_Designer`);

--
-- Indexes for table `follow`
--
ALTER TABLE `follow`
  ADD KEY `Id_Account` (`Id_Account`),
  ADD KEY `follow_account` (`Id_Follower`);

--
-- Indexes for table `kategori`
--
ALTER TABLE `kategori`
  ADD PRIMARY KEY (`Id_Kategori`);

--
-- Indexes for table `merk`
--
ALTER TABLE `merk`
  ADD PRIMARY KEY (`Id_Merk`);

--
-- Indexes for table `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`Id_Review`);

--
-- Indexes for table `sub_kategori`
--
ALTER TABLE `sub_kategori`
  ADD PRIMARY KEY (`Id_Subkategori`),
  ADD KEY `sub_kategori_kategori` (`Id_Kategori`);

--
-- Indexes for table `tas`
--
ALTER TABLE `tas`
  ADD PRIMARY KEY (`Id_Tas`),
  ADD KEY `tas_subkategori` (`Id_Subkategori`),
  ADD KEY `tas_merk` (`Id_Merk`),
  ADD KEY `tas_designer` (`Id_Designer`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account`
--
ALTER TABLE `account`
  MODIFY `Id_Account` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `designer`
--
ALTER TABLE `designer`
  MODIFY `Id_Designer` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `kategori`
--
ALTER TABLE `kategori`
  MODIFY `Id_Kategori` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `merk`
--
ALTER TABLE `merk`
  MODIFY `Id_Merk` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `review`
--
ALTER TABLE `review`
  MODIFY `Id_Review` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `sub_kategori`
--
ALTER TABLE `sub_kategori`
  MODIFY `Id_Subkategori` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `tas`
--
ALTER TABLE `tas`
  MODIFY `Id_Tas` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `follow`
--
ALTER TABLE `follow`
  ADD CONSTRAINT `fk_constraint1` FOREIGN KEY (`Id_Account`) REFERENCES `account` (`Id_Account`),
  ADD CONSTRAINT `fk_constraint2` FOREIGN KEY (`Id_Follower`) REFERENCES `account` (`Id_Account`);

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
