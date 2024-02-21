-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- 생성 시간: 23-11-28 04:44
-- 서버 버전: 10.4.28-MariaDB
-- PHP 버전: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 데이터베이스: `cparters`
--

-- --------------------------------------------------------

--
-- 테이블 구조 `goods`
--

CREATE TABLE `goods` (
  `id` int(11) NOT NULL,
  `goods_name` varchar(20) NOT NULL,
  `goods_url` varchar(255) NOT NULL,
  `goods_image` varchar(255) NOT NULL,
  `category` varchar(20) NOT NULL,
  `goods_price` varchar(30) NOT NULL,
  `goods_discount_price` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='상품 기본 정보';

--
-- 테이블의 덤프 데이터 `goods`
--

INSERT INTO `goods` (`id`, `goods_name`, `goods_url`, `goods_image`, `category`, `goods_price`, `goods_discount_price`) VALUES
(1, '제오닉 블랙 김장 김치통 원핸들', 'https://link.coupang.com/a/bfke1M', 'https://image8.coupangcdn.com/image/retail/images/6846645543246365-2fc0bf83-00d7-4942-a658-2de6cc5224c6.jpg', 'Food', '37,700원 (100g당 873원) 쿠팡판매가', '26,900원 (100g당 623원) 와우할인가'),
(21, '저탄소인증 특등급 완전미', 'https://link.coupang.com/a/bhsJRw', '//thumbnail9.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/8785747230268700-38399170-a409-4a7b-97f3-02b133cd9b25.jpg', 'Food', '33,900원 (100g당 339원) 쿠팡판매가', '24,900원 (100g당 249원) 와우쿠폰할인가'),
(22, '[융털기모/일자바지] 여성 일자핏 기', 'https://link.coupang.com/a/bhs69n', '//thumbnail10.coupangcdn.com/thumbnails/remote/492x492ex/image/vendor_inventory/f0af/4448dbb39c326c9034f734c1b301fb0c3ba3fe1dfb19c690dba781fc5082.jpg', 'fashion-sundries', '13,900원 쿠팡판매가', '6,900원 와우쿠폰할인가'),
(23, 'SK매직 전자레인지 터치식 25L', 'https://link.coupang.com/a/bhs7PT', '//thumbnail6.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/1144394997964569-214a478a-0154-4c73-b328-37a7f9f67130.jpg', 'kitchen', '103,000원 쿠팡판매가', '83,640원 와우쿠폰할인가'),
(24, '팔도왕뚜껑 미니 왕뚜껑 컵라면 80g', 'https://link.coupang.com/a/bhs8cm', '//thumbnail6.coupangcdn.com/thumbnails/remote/492x492ex/image/product/image/vendoritem/2018/10/24/3059530010/b6c659cf-f368-431a-8982-87cb929a4558.jpg', 'Food', '12,260원 (1개당 766원) 즉시할인가', '3,540원 (1개당 221원) 와우쿠폰할인가'),
(25, '남성용 경량 웰론 퀼팅 패딩 자켓', 'https://link.coupang.com/a/bhtDeo', '//thumbnail8.coupangcdn.com/thumbnails/remote/492x492ex/image/vendor_inventory/68ca/8a8bd4b0a429e0dffed63de7cb13704348598a8b484c95931d661ea8272f.jpg', 'fashion-sundries', '38,900원 쿠팡판매가', '31,900원 와우쿠폰할인가'),
(26, '히말라야 립밤 10g 튜브형', 'https://link.coupang.com/a/bhtDAs', '//thumbnail6.coupangcdn.com/thumbnails/remote/492x492ex/image/product/image/vendoritem/2019/06/10/3000155388/7912e04c-8140-42d0-a0a0-12b57c105392.jpg', 'Beauty', '2,500원 (1g당 250원) 쿠팡판매가', '0원 (1g당 0원) 와우쿠폰할인가'),
(27, '에어보스 리머X 휴대용 유모차 쿠버 ', 'https://link.coupang.com/a/bhtD0P', '//thumbnail7.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/1667906633234173-f3ba8bc5-1ef3-43f8-927e-14d7e362eb63.jpg', 'child-birth', '138,000원 쿠팡판매가', '131,000원 와우쿠폰할인가'),
(28, '헤트라스 프리미엄 대용량 디퓨저 선물', 'https://link.coupang.com/a/bhtEI8', '//thumbnail8.coupangcdn.com/thumbnails/remote/492x492ex/image/rs_quotation_api/yehqbfm9/0d9ebe7403814ceab31d2b873c7053b6.jpg', 'home_decoration', '25,700원 (10ml당 171원) 쿠팡판매가', '18,700원 (10ml당 125원) 와우쿠폰할인가'),
(29, '강아지 스틱 소가죽우유껌 250g 4', 'https://link.coupang.com/a/bhtEW8', '//thumbnail10.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/2022/12/28/17/4/3b254f04-a8e5-4435-a3dc-5699f68a0662.jpg', 'pet', '14,050원 (10g당 281원) 쿠팡판매가', '6,050원 (10g당 121원) 와우쿠폰할인가'),
(30, '코멧 스포츠 풀업밴드', 'https://link.coupang.com/a/bhtFdh', '//thumbnail7.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/59126923088969-968ebdfc-6214-4c7f-be75-f02eb833fcfb.jpg', 'sports', '15,190원 쿠팡판매가', '8,190원 와우쿠폰할인가'),
(31, '코멧 육각 덤벨 아령 블랙 5kg, ', 'https://link.coupang.com/a/bhtFur', '//thumbnail10.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/224439308575519-8671e315-7f73-4f30-a7c7-2e097d964530.jpg', 'sports', '12,990원 (1개당 6,495원) 쿠팡판매가', '5,990원 (1개당 2,995원) 와우쿠폰할인가'),
(32, '목우촌 국내산 소고기 양지 국거리', 'https://link.coupang.com/a/bhtFLS', '//thumbnail9.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/2807889061718768-e1117d33-c66f-4e0b-9291-846030ed7a71.jpg', 'Food', '12,490원 (100g당 4,163원) 즉시할인가', '5,490원 (100g당 1,830원) 와우쿠폰할인가'),
(33, '팔도왕뚜껑 미니 왕뚜껑 컵라면 80g', 'https://link.coupang.com/a/bhvMgf', '//thumbnail7.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/1699314446042438-3323027d-a99f-4883-9cea-7c593c80295e.jpg', 'Food', '5,070원 (1개당 845원) 쿠팡판매가', '0원 (1개당 0원) 와우쿠폰할인가');

-- --------------------------------------------------------

--
-- 테이블 구조 `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `user_id` varchar(30) NOT NULL,
  `user_pw` varchar(150) NOT NULL,
  `user_email` varchar(10) NOT NULL,
  `role` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 테이블의 덤프 데이터 `users`
--

INSERT INTO `users` (`id`, `user_id`, `user_pw`, `user_email`, `role`) VALUES
(7, 'qwert', '*84AAC12F54AB666ECFC2A83C676908C8BBC381B1', 'qwf@qwnf.c', 3),
(8, 'hyeon', '*84AAC12F54AB666ECFC2A83C676908C8BBC381B1', 'qwf@qwnf.c', 0);

--
-- 덤프된 테이블의 인덱스
--

--
-- 테이블의 인덱스 `goods`
--
ALTER TABLE `goods`
  ADD PRIMARY KEY (`id`);

--
-- 테이블의 인덱스 `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- 덤프된 테이블의 AUTO_INCREMENT
--

--
-- 테이블의 AUTO_INCREMENT `goods`
--
ALTER TABLE `goods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- 테이블의 AUTO_INCREMENT `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
