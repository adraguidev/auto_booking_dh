package com.autobooking.api.service;

import com.autobooking.api.model.Category;
import com.autobooking.api.model.Product;
import com.autobooking.api.repository.CategoryRepository;
import com.autobooking.api.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    public Category createCategory(String name) {
        // Validar que el nombre no esté vacío
        if (name == null || name.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre de la categoría no puede estar vacío");
        }

        // Validar que no exista una categoría con el mismo nombre
        Optional<Category> existingCategory = categoryRepository.findByName(name.trim());
        if (existingCategory.isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe una categoría con ese nombre");
        }

        // Crear y guardar la nueva categoría
        Category category = new Category(name.trim());
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        // Verificar que la categoría existe
        if (!categoryRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoría no encontrada con ID: " + id);
        }

        // Obtener productos asociados a esta categoría
        List<Product> productsWithCategory = productRepository.findByCategoryId(id);

        // Quitar la categoría de esos productos
        for (Product product : productsWithCategory) {
            product.setCategory(null);
            productRepository.save(product);
        }

        // Eliminar la categoría
        categoryRepository.deleteById(id);
    }

    public List<Category> listCategories() {
        return categoryRepository.findAll();
    }

    public Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoría no encontrada con ID: " + id));
    }
} 