# ************************************************************
# Sequel Ace SQL dump
# Version 20062
#
# https://sequel-ace.com/
# https://github.com/Sequel-Ace/Sequel-Ace
#
# Host: 127.0.0.1 (MySQL 8.1.0)
# Database: user_database
# Generation Time: 2023-12-01 09:26:47 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
SET NAMES utf8mb4;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE='NO_AUTO_VALUE_ON_ZERO', SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table contact_table
# ------------------------------------------------------------

DROP TABLE IF EXISTS `contact_table`;

CREATE TABLE `contact_table` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `message` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `contact_table` WRITE;
/*!40000 ALTER TABLE `contact_table` DISABLE KEYS */;

INSERT INTO `contact_table` (`id`, `name`, `email`, `password`, `message`)
VALUES
	(2,'이재호','asdf@asdf.com','1324','아 ㅋㅋ 성공 ㅋㅋ'),
	(14,'김철수','a@a.com','1234','영희 보고 싶다'),
	(15,'가천대','asdf@asdf.com','0000','수정됐어요');

/*!40000 ALTER TABLE `contact_table` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table index_table
# ------------------------------------------------------------

DROP TABLE IF EXISTS `index_table`;

CREATE TABLE `index_table` (
  `name` varchar(255) NOT NULL,
  `id` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `index_table` WRITE;
/*!40000 ALTER TABLE `index_table` DISABLE KEYS */;

INSERT INTO `index_table` (`name`, `id`, `password`)
VALUES
	('가천대','lht12345','1324mm55'),
	('이재호','lht1324','1324mm55');

/*!40000 ALTER TABLE `index_table` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table user_table
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user_table`;

CREATE TABLE `user_table` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phoneNumber` varchar(20) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `user_table` WRITE;
/*!40000 ALTER TABLE `user_table` DISABLE KEYS */;

INSERT INTO `user_table` (`id`, `name`, `email`, `phoneNumber`, `password`)
VALUES
	(18,'이재호','lht1324@naver.com','010-9425-2419','1324'),
	(19,'김철수','asdf@asdf.com','010-1234-5678','0000');

/*!40000 ALTER TABLE `user_table` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
