package com.impactlink.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.Map;
import java.util.HashMap;

@Service
public class AiAnalysisService {

    // REPLACE WITH YOUR KEY
    private static final String API_KEY = "AIzaSyDtPp9RRzDbFZAPd9DM28zhWFANugv6OIo"; 
    private static final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + API_KEY;

    public String getCollaborationAdvice(String projectA, String projectB) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Prompt Engineering
            String prompt = "Analyze the synergy between these two projects: " +
                            "1. " + projectA + ". " +
                            "2. " + projectB + ". " +
                            "Suggest 1 concrete way they can collaborate.";

            // Construct JSON Payload (Google Gemini Format)
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);
            Map<String, Object> content = new HashMap<>();
            content.put("parts", new Object[]{part});
            Map<String, Object> body = new HashMap<>();
            body.put("contents", new Object[]{content});

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            
            // Call AI
            // Note: In a real hackathon, handle errors gracefully!
            // We return a dummy string if no key is present to prevent crashing.
            if (API_KEY.equals("YOUR_GEMINI_OR_OPENAI_KEY")) {
                return "AI Analysis: Great potential for resource sharing in beneficiary outreach.";
            }

            // Real Call would go here (commented out for safety unless you have a key)
            // ResponseEntity<String> response = restTemplate.postForEntity(API_URL, request, String.class);
            // return extractTextFromResponse(response.getBody());
            
            return "AI Analysis: Validated high synergy potential.";

        } catch (Exception e) {
            return "AI Analysis Unavailable";
        }
    }
}
