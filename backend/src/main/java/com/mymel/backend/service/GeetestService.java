package com.mymel.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class GeetestService {

    private static final String GEETEST_VERIFY_URL = "http://gcaptcha4.geetest.com/validate";

    @Value("${geetest.id:647f5ed2ed8acb4be36784e01556bb71}")
    private String geetestId;

    @Value("${geetest.key:b09a7aaf52c1170ce8951717208d24bd}")
    private String geetestKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean verifyToken(String lotNumber, String captchaOutput, String passToken, String genTime) {
        if (lotNumber == null || passToken == null || genTime == null || captchaOutput == null) {
            return false;
        }

        try {
            String signToken = generateSignToken(lotNumber, geetestKey);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("captcha_id", geetestId);
            map.add("lot_number", lotNumber);
            map.add("pass_token", passToken);
            map.add("gen_time", genTime);
            map.add("captcha_output", captchaOutput);
            map.add("sign_token", signToken);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(GEETEST_VERIFY_URL, request, Map.class);
            Map<String, Object> body = response.getBody();

            if (body != null && "success".equals(body.get("result"))) {
                return true;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return false;
    }

    private String generateSignToken(String lotNumber, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(lotNumber.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
