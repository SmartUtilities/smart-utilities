CREATE TABLE `consumers` (
  `tid` bigint(20) NOT NULL,
  `consumer` varchar(200) NOT NULL,
  `duration` tinyint(3) unsigned NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `providers` (
  `tid` bigint(20) unsigned NOT NULL,
  `provider` varchar(200) NOT NULL,
  `service` varchar(100) NOT NULL,
  `service_start` tinyint(3) unsigned NOT NULL,
  `service_end` tinyint(3) unsigned NOT NULL,
  `price` int(11) NOT NULL,
  `scheme` varchar(100) NOT NULL,
  `hostname` varchar(200) NOT NULL,
  `port` varchar(100) NOT NULL,
  `url_prefix` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
