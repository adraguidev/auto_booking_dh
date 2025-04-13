package com.autobooking.api.controller;

import com.autobooking.api.model.Feature;
import com.autobooking.api.service.FeatureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/features")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class FeatureController {

    private final FeatureService featureService;

    @Autowired
    public FeatureController(FeatureService featureService) {
        this.featureService = featureService;
    }

    @PostMapping
    public ResponseEntity<?> createFeature(@RequestBody Map<String, String> featureRequest) {
        try {
            String name = featureRequest.get("name");
            String icon = featureRequest.get("icon");
            
            Feature feature = featureService.createFeature(name, icon);
            return new ResponseEntity<>(feature, HttpStatus.CREATED);
        } catch (ResponseStatusException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getReason());
            return new ResponseEntity<>(response, e.getStatusCode());
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error al crear característica: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<Feature>> listFeatures() {
        List<Feature> features = featureService.listFeatures();
        return new ResponseEntity<>(features, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFeature(@PathVariable Long id) {
        try {
            Feature feature = featureService.findById(id);
            return new ResponseEntity<>(feature, HttpStatus.OK);
        } catch (ResponseStatusException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getReason());
            return new ResponseEntity<>(response, e.getStatusCode());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFeature(@PathVariable Long id) {
        try {
            featureService.deleteFeature(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (ResponseStatusException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getReason());
            return new ResponseEntity<>(response, e.getStatusCode());
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error al eliminar característica: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 