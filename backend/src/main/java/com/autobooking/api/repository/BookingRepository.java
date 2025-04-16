package com.autobooking.api.repository;

import com.autobooking.api.model.Booking;
import com.autobooking.api.model.Booking.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    // Buscar reservas por id de usuario
    List<Booking> findByUserId(Long userId);
    
    // Buscar reservas por id de producto
    List<Booking> findByProductId(Long productId);
    
    // Buscar reservas por estado
    List<Booking> findByStatus(Booking.BookingStatus status);
    
    // Buscar reservas entre fechas
    List<Booking> findByStartDateGreaterThanEqualAndEndDateLessThanEqual(
            LocalDate startDate, LocalDate endDate);
    
    // Verificar si existen reservas para un producto en un rango de fechas específico
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.product.id = :productId " +
           "AND b.status != :cancelledStatus " +
           "AND ((b.startDate BETWEEN :startDate AND :endDate) " +
           "OR (b.endDate BETWEEN :startDate AND :endDate) " +
           "OR (:startDate BETWEEN b.startDate AND b.endDate))")
    boolean existsOverlappingBooking(
            @Param("productId") Long productId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("cancelledStatus") Booking.BookingStatus cancelledStatus);
            
    // Obtener todas las reservas activas (no canceladas) para un producto
    @Query("SELECT b FROM Booking b WHERE b.product.id = :productId " +
           "AND b.status != :cancelledStatus " +
           "AND b.endDate >= CURRENT_DATE " +
           "AND (b.status = com.autobooking.api.model.Booking$BookingStatus.PENDING " +
           "   OR b.status = com.autobooking.api.model.Booking$BookingStatus.CONFIRMED) " +
           "ORDER BY b.startDate")
    List<Booking> findActiveBookingsByProductId(
            @Param("productId") Long productId,
            @Param("cancelledStatus") Booking.BookingStatus cancelledStatus);
} 