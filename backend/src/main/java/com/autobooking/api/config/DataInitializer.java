package com.autobooking.api.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

import javax.sql.DataSource;

@Configuration
public class DataInitializer {

    @Autowired
    private DataSource dataSource;

    @Bean
    public CommandLineRunner loadData() {
        return args -> {
            // Esto solo ejecutará el script si se pasa el argumento --init-db
            if (args.length > 0 && args[0].equals("--init-db")) {
                System.out.println("Inicializando base de datos con datos de ejemplo...");
                ResourceDatabasePopulator resourceDatabasePopulator = new ResourceDatabasePopulator(false, false, "UTF-8", new ClassPathResource("data.sql"));
                resourceDatabasePopulator.execute(dataSource);
                System.out.println("Base de datos inicializada con éxito.");
            }
        };
    }
} 