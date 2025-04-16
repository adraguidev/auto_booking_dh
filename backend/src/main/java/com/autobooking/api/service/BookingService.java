package com.autobooking.api.service;

import com.autobooking.api.model.Booking;
import com.autobooking.api.model.Product;
import com.autobooking.api.model.User;
import com.autobooking.api.repository.BookingRepository;
import com.autobooking.api.repository.ProductRepository;
import com.autobooking.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Autowired
    public BookingService(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            ProductRepository productRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    public List<Booking> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getBookingsByProduct(Long productId) {
        return bookingRepository.findByProductId(productId);
    }

    @Transactional
    public Booking createBooking(Long userId, Long productId, LocalDate startDate, LocalDate endDate) {
        System.out.println("DEBUG - Creando reserva para producto: " + productId + 
                ", usuario: " + userId + ", desde: " + startDate + ", hasta: " + endDate);
        
        // Validar que las fechas son correctas
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("La fecha de inicio debe ser anterior a la fecha final");
        }
        
        if (startDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("No se pueden hacer reservas con fechas pasadas");
        }

        // Buscar usuario y producto
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Producto no encontrado"));

        // Validar que el producto tiene un precio válido
        if (product.getPrice() == null) {
            throw new IllegalStateException("El producto no tiene un precio definido. Producto ID: " + productId);
        }

        // Verificar si el producto está disponible para las fechas solicitadas
        System.out.println("DEBUG - Verificando disponibilidad...");
        if (!isProductAvailable(productId, startDate, endDate)) {
            System.out.println("DEBUG - Producto NO disponible para las fechas solicitadas");
            throw new IllegalStateException("Ya existe una reserva para este producto en las fechas seleccionadas");
        }
        System.out.println("DEBUG - Producto disponible para las fechas solicitadas");

        // Calcular el número de días
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        
        // Calcular el precio total
        BigDecimal totalPrice = product.getPrice().multiply(BigDecimal.valueOf(days));

        // Crear la reserva
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setProduct(product);
        booking.setStartDate(startDate);
        booking.setEndDate(endDate);
        booking.setTotalPrice(totalPrice);
        booking.setStatus(Booking.BookingStatus.PENDING);
        booking.setCreatedAt(LocalDate.now());
        
        System.out.println("DEBUG - Reserva creada: " + booking);
        
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking updateBookingStatus(Long bookingId, Booking.BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Reserva no encontrada"));
        
        // Validar transición de estado
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new IllegalStateException("No se puede actualizar una reserva cancelada");
        }
        
        booking.setStatus(newStatus);
        return bookingRepository.save(booking);
    }

    @Transactional
    public void cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Reserva no encontrada"));
        
        // Solo se pueden cancelar reservas pendientes o confirmadas
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new IllegalStateException("La reserva ya está cancelada");
        }
        
        if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            throw new IllegalStateException("No se puede cancelar una reserva completada");
        }
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    public boolean isProductAvailable(Long productId, LocalDate startDate, LocalDate endDate) {
        System.out.println("DEBUG - Verificando disponibilidad para producto: " + productId +
                " desde: " + startDate + " hasta: " + endDate);
                
        // Obtener todas las reservas activas para el producto
        List<Booking> activeBookings = bookingRepository.findAllActiveBookingsForProduct(productId);
        System.out.println("DEBUG - Reservas activas encontradas: " + activeBookings.size());
        
        // Verificar si alguna de las reservas se solapa con el rango solicitado
        for (Booking booking : activeBookings) {
            // Un solapamiento ocurre cuando:
            // 1. La fecha de inicio o fin de la reserva existente está dentro del rango solicitado
            // 2. El rango solicitado está completamente dentro de la reserva existente
            // 3. La reserva existente está completamente dentro del rango solicitado
            
            // Verificar si hay solapamiento
            boolean noOverlap = booking.getEndDate().isBefore(startDate) || booking.getStartDate().isAfter(endDate);
            
            if (!noOverlap) {
                System.out.println("DEBUG - Solapamiento encontrado con reserva ID: " + booking.getId() + 
                    ", " + booking.getStartDate() + " - " + booking.getEndDate() + 
                    ", Estado: " + booking.getStatus());
                System.out.println("DEBUG - Rango solicitado: " + startDate + " - " + endDate);
                System.out.println("DEBUG - Detalles del solapamiento:");
                System.out.println("  - ¿Inicio reserva dentro del rango? " + 
                    (booking.getStartDate().compareTo(startDate) >= 0 && booking.getStartDate().compareTo(endDate) <= 0));
                System.out.println("  - ¿Fin reserva dentro del rango? " + 
                    (booking.getEndDate().compareTo(startDate) >= 0 && booking.getEndDate().compareTo(endDate) <= 0));
                System.out.println("  - ¿Inicio solicitado dentro de reserva? " + 
                    (startDate.compareTo(booking.getStartDate()) >= 0 && startDate.compareTo(booking.getEndDate()) <= 0));
                System.out.println("  - ¿Fin solicitado dentro de reserva? " + 
                    (endDate.compareTo(booking.getStartDate()) >= 0 && endDate.compareTo(booking.getEndDate()) <= 0));
                
                return false;
            }
        }
        
        System.out.println("DEBUG - No se encontraron solapamientos, producto disponible");
        return true;
    }

    public List<Booking> getActiveBookingsForProduct(Long productId) {
        System.out.println("DEBUG - Buscando reservas activas para producto ID: " + productId);
        List<Booking> bookings = bookingRepository.findAllActiveBookingsForProduct(productId);
        System.out.println("DEBUG - Encontradas " + bookings.size() + " reservas activas");
        
        for (Booking booking : bookings) {
            System.out.println("DEBUG - Reserva ID: " + booking.getId() + 
                ", Estado: " + booking.getStatus() + 
                ", Desde: " + booking.getStartDate() + 
                ", Hasta: " + booking.getEndDate());
        }
        
        return bookings;
    }
} 