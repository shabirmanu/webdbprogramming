-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- 생성 시간: 23-12-01 05:25
-- 서버 버전: 10.4.28-MariaDB
-- PHP 버전: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 데이터베이스: `ums`
--

-- --------------------------------------------------------

--
-- 테이블 구조 `content`
--

CREATE TABLE `content` (
  `username` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `password` int(11) NOT NULL,
  `content` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 테이블의 덤프 데이터 `content`
--

INSERT INTO `content` (`username`, `title`, `password`, `content`) VALUES
('lee', '421421', 0, '412421421'),
('park', '1234', 0, '321321231');

--
-- 덤프된 테이블의 인덱스
--

--
-- 테이블의 인덱스 `content`
--
ALTER TABLE `content`
  ADD PRIMARY KEY (`username`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
