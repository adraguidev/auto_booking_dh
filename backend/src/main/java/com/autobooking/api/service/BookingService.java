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

        // Verificar si hay solapamiento con otras reservas
        if (bookingRepository.existsOverlappingBooking(
                productId, startDate, endDate, Booking.BookingStatus.CANCELLED)) {
            throw new IllegalStateException("Ya existe una reserva para este producto en las fechas seleccionadas");
        }

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
        return !bookingRepository.existsOverlappingBooking(
                productId, startDate, endDate, Booking.BookingStatus.CANCELLED);
    }

    public List<Booking> getActiveBookingsForProduct(Long productId) {
        return bookingRepository.findActiveBookingsByProductId(
                productId, Booking.BookingStatus.CANCELLED);
    }
} 