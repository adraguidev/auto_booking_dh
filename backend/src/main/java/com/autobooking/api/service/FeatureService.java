package com.autobooking.api.service;

import com.autobooking.api.model.Feature;
import com.autobooking.api.model.Product;
import com.autobooking.api.repository.FeatureRepository;
import com.autobooking.api.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class FeatureService {

    private final FeatureRepository featureRepository;
    private final ProductRepository productRepository;

    @Autowired
    public FeatureService(FeatureRepository featureRepository, ProductRepository productRepository) {
        this.featureRepository = featureRepository;
        this.productRepository = productRepository;
    }

    public Feature createFeature(String name, String icon) {
        // Validar que el nombre no esté vacío
        if (name == null || name.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre de la característica no puede estar vacío");
        }

        // Validar que no exista una característica con el mismo nombre
        Optional<Feature> existingFeature = featureRepository.findByName(name.trim());
        if (existingFeature.isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe una característica con ese nombre");
        }

        // Crear y guardar la nueva característica
        Feature feature = new Feature(name.trim(), icon);
        return featureRepository.save(feature);
    }

    public void deleteFeature(Long id) {
        // Verificar que la característica existe
        Feature feature = featureRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Característica no encontrada con ID: " + id));

        // Buscar productos que tengan esta característica
        List<Product> productsWithFeature = productRepository.findByFeaturesId(id);

        // Quitar la característica de esos productos
        for (Product product : productsWithFeature) {
            product.removeFeature(feature);
            productRepository.save(product);
        }

        // Eliminar la característica
        featureRepository.deleteById(id);
    }

    public List<Feature> listFeatures() {
        return featureRepository.findAll();
    }

    public Feature findById(Long id) {
        return featureRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Característica no encontrada con ID: " + id));
    }
} 