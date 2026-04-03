-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: login_database_amravati_connect
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `taluka_village`
--

DROP TABLE IF EXISTS `taluka_village`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `taluka_village` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `t_name` varchar(255) DEFAULT NULL,
  `v_name` varchar(255) DEFAULT NULL,
  `created_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `taluka_village`
--

LOCK TABLES `taluka_village` WRITE;
/*!40000 ALTER TABLE `taluka_village` DISABLE KEYS */;
INSERT INTO `taluka_village` VALUES (1,'Khamgaon','Pimpalgaon','2026-04-03 09:14:50','2026-04-03 09:14:50'),(2,'Khamgaon','Nimgaon','2026-04-03 09:14:50','2026-04-03 09:14:50'),(3,'Khamgaon','Rajura','2026-04-03 09:14:50','2026-04-03 09:14:50'),(4,'Khamgaon','Dhamangaon','2026-04-03 09:14:50','2026-04-03 09:14:50'),(5,'Khamgaon','Sangvi','2026-04-03 09:14:50','2026-04-03 09:14:50'),(6,'Shegaon','Chincholi','2026-04-03 09:14:50','2026-04-03 09:14:50'),(7,'Shegaon','Gavhan','2026-04-03 09:14:50','2026-04-03 09:14:50'),(8,'Shegaon','Takli','2026-04-03 09:14:50','2026-04-03 09:14:50'),(9,'Shegaon','Manasgaon','2026-04-03 09:14:50','2026-04-03 09:14:50'),(10,'Shegaon','Hingna','2026-04-03 09:14:50','2026-04-03 09:14:50'),(11,'Malkapur','Borakhadi','2026-04-03 09:14:50','2026-04-03 09:14:50'),(12,'Malkapur','Wadoda','2026-04-03 09:14:50','2026-04-03 09:14:50'),(13,'Malkapur','Dongaon','2026-04-03 09:14:50','2026-04-03 09:14:50'),(14,'Malkapur','Khadki','2026-04-03 09:14:50','2026-04-03 09:14:50'),(15,'Malkapur','Bhadgaon','2026-04-03 09:14:50','2026-04-03 09:14:50'),(16,'Nandura','Waghala','2026-04-03 09:14:50','2026-04-03 09:14:50'),(17,'Nandura','Kothali','2026-04-03 09:14:50','2026-04-03 09:14:50'),(18,'Nandura','Taroda','2026-04-03 09:14:50','2026-04-03 09:14:50'),(19,'Nandura','Savkhed','2026-04-03 09:14:50','2026-04-03 09:14:50'),(20,'Nandura','Palshi','2026-04-03 09:14:50','2026-04-03 09:14:50'),(21,'Jalgaon Jamod','Asalgaon','2026-04-03 09:14:50','2026-04-03 09:14:50'),(22,'Jalgaon Jamod','Pahurjira','2026-04-03 09:14:50','2026-04-03 09:14:50'),(23,'Jalgaon Jamod','Sonala','2026-04-03 09:14:50','2026-04-03 09:14:50'),(24,'Jalgaon Jamod','Bhendwal','2026-04-03 09:14:50','2026-04-03 09:14:50'),(25,'Jalgaon Jamod','Kherda','2026-04-03 09:14:50','2026-04-03 09:14:50'),(26,'Mehkar','Deulgaon Mali','2026-04-03 09:54:37','2026-04-03 09:54:37'),(27,'Mehkar','Lonarwadi','2026-04-03 09:54:37','2026-04-03 09:54:37'),(28,'Mehkar','Ghatbori','2026-04-03 09:54:37','2026-04-03 09:54:37'),(29,'Mehkar','Sultanpur','2026-04-03 09:54:37','2026-04-03 09:54:37'),(30,'Mehkar','Hiwara','2026-04-03 09:54:37','2026-04-03 09:54:37'),(31,'Chikhli','Eklara','2026-04-03 09:54:37','2026-04-03 09:54:37'),(32,'Chikhli','Kelwad','2026-04-03 09:54:37','2026-04-03 09:54:37'),(33,'Chikhli','Isoli','2026-04-03 09:54:37','2026-04-03 09:54:37'),(34,'Chikhli','Pimpalner','2026-04-03 09:54:37','2026-04-03 09:54:37'),(35,'Chikhli','Gangalgaon','2026-04-03 09:54:37','2026-04-03 09:54:37'),(36,'Deulgaon Raja','Sindkhed','2026-04-03 09:54:37','2026-04-03 09:54:37'),(37,'Deulgaon Raja','Andhera','2026-04-03 09:54:37','2026-04-03 09:54:37'),(38,'Deulgaon Raja','Nimgaon Guru','2026-04-03 09:54:37','2026-04-03 09:54:37'),(39,'Deulgaon Raja','Mandwa','2026-04-03 09:54:37','2026-04-03 09:54:37'),(40,'Deulgaon Raja','Chinchkhed','2026-04-03 09:54:37','2026-04-03 09:54:37'),(41,'Buldhana','Sakharkherda','2026-04-03 09:54:37','2026-04-03 09:54:37'),(42,'Buldhana','Dhad','2026-04-03 09:54:37','2026-04-03 09:54:37'),(43,'Buldhana','Motha','2026-04-03 09:54:37','2026-04-03 09:54:37'),(44,'Buldhana','Yelgaon','2026-04-03 09:54:37','2026-04-03 09:54:37'),(45,'Buldhana','Kolwad','2026-04-03 09:54:37','2026-04-03 09:54:37'),(46,'Motala','Ridhora','2026-04-03 09:54:37','2026-04-03 09:54:37'),(47,'Motala','Taroda','2026-04-03 09:54:37','2026-04-03 09:54:37'),(48,'Motala','Pangra','2026-04-03 09:54:37','2026-04-03 09:54:37'),(49,'Motala','Nimkhed','2026-04-03 09:54:37','2026-04-03 09:54:37'),(50,'Motala','Shelgaon','2026-04-03 09:54:37','2026-04-03 09:54:37');
/*!40000 ALTER TABLE `taluka_village` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-03 16:29:08
