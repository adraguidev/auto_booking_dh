package com.autobooking.api.controller;

import com.autobooking.api.model.Feature;
import com.autobooking.api.service.FeatureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/features")
public class FeatureController {

    private final FeatureService featureService;

    @Autowired
    public FeatureController(FeatureService featureService) {
        this.featureService = featureService;
    }

    @PostMapping
    public ResponseEntity<Feature> createFeature(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String icon = payload.get("icon");

        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Feature newFeature = featureService.createFeature(name, icon);
        return ResponseEntity.status(HttpStatus.CREATED).body(newFeature);
    }

    @GetMapping
    public ResponseEntity<List<Feature>> getAllFeatures() {
        List<Feature> features = featureService.listFeatures();
        return ResponseEntity.ok(features);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeature(@PathVariable Long id) {
        try {
            featureService.deleteFeature(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
} 