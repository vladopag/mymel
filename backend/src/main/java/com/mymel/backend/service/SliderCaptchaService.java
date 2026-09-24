package com.mymel.backend.service;

import com.mymel.backend.dto.BufferDto;
import com.mymel.backend.dto.CaptchaChallengeResponse;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.Path2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SliderCaptchaService {

    private static final int BG_WIDTH = 250;
    private static final int BG_HEIGHT = 150;
    private static final int SLIDER_WIDTH = 60;
    private static final int SLIDER_HEIGHT = 150;
    private static final int PIECE_SIZE = 40;
    private static final double TOLERANCE = 7.0; // Allowed ±7px deviation

    private final SecureRandom random = new SecureRandom();
    private final Map<String, ChallengeData> challenges = new ConcurrentHashMap<>();
    private final Map<String, Long> validTokens = new ConcurrentHashMap<>();

    public static class ChallengeData {
        private final String id;
        private final double solutionX;
        private final long createdAt;

        public ChallengeData(String id, double solutionX) {
            this.id = id;
            this.solutionX = solutionX;
            this.createdAt = System.currentTimeMillis();
        }

        public String getId() {
            return id;
        }

        public double getSolutionX() {
            return solutionX;
        }

        public long getCreatedAt() {
            return createdAt;
        }

        public boolean isExpired() {
            return (System.currentTimeMillis() - createdAt) > 120_000L; // 2 minutes
        }
    }

    public CaptchaChallengeResponse createChallenge() {
        String challengeId = UUID.randomUUID().toString();

        // Target coordinates for cutout
        int minX = PIECE_SIZE + 20;
        int maxX = BG_WIDTH - PIECE_SIZE - 20;
        int targetX = minX + random.nextInt(maxX - minX + 1);

        int minY = 20;
        int maxY = BG_HEIGHT - PIECE_SIZE - 20;
        int targetY = minY + random.nextInt(maxY - minY + 1);

        // 1. Generate full background image with rich patterns
        BufferedImage bg = new BufferedImage(BG_WIDTH, BG_HEIGHT, BufferedImage.TYPE_INT_ARGB);
        Graphics2D gBg = bg.createGraphics();
        gBg.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // Gradient background
        Color color1 = new Color(random.nextInt(60), random.nextInt(80) + 40, random.nextInt(100) + 80);
        Color color2 = new Color(random.nextInt(80) + 20, random.nextInt(60), random.nextInt(80) + 40);
        GradientPaint gp = new GradientPaint(0, 0, color1, BG_WIDTH, BG_HEIGHT, color2);
        gBg.setPaint(gp);
        gBg.fillRect(0, 0, BG_WIDTH, BG_HEIGHT);

        // Dynamic background shapes
        for (int i = 0; i < 6; i++) {
            gBg.setColor(new Color(random.nextInt(256), random.nextInt(256), random.nextInt(256), 80));
            int shapeType = random.nextInt(3);
            int sx = random.nextInt(BG_WIDTH - 40);
            int sy = random.nextInt(BG_HEIGHT - 40);
            int sw = 40 + random.nextInt(80);
            int sh = 40 + random.nextInt(80);
            if (shapeType == 0) {
                gBg.fillOval(sx, sy, sw, sh);
            } else if (shapeType == 1) {
                gBg.fillRoundRect(sx, sy, sw, sh, 16, 16);
            } else {
                gBg.fillRect(sx, sy, sw, sh);
            }
        }

        // Grid lines for visual structure
        gBg.setColor(new Color(255, 255, 255, 25));
        for (int x = 0; x < BG_WIDTH; x += 25) {
            gBg.drawLine(x, 0, x, BG_HEIGHT);
        }
        for (int y = 0; y < BG_HEIGHT; y += 25) {
            gBg.drawLine(0, y, BG_WIDTH, y);
        }

        // 2. Slider piece image (SLIDER_WIDTH x SLIDER_HEIGHT)
        BufferedImage sliderImg = new BufferedImage(SLIDER_WIDTH, SLIDER_HEIGHT, BufferedImage.TYPE_INT_ARGB);
        Graphics2D gSlider = sliderImg.createGraphics();
        gSlider.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // The piece is at (sliderPieceX = 0, sliderPieceY = targetY)
        int sliderPieceX = 0;
        Shape sliderPieceShape = createPuzzlePieceShape(sliderPieceX, targetY, PIECE_SIZE);

        // Clip slider image to puzzle piece and draw portion from background
        gSlider.setClip(sliderPieceShape);
        gSlider.drawImage(bg, -targetX, 0, null);
        gSlider.setClip(null);

        // Stroke puzzle piece outline
        gSlider.setColor(new Color(255, 255, 255, 220));
        gSlider.setStroke(new BasicStroke(1.5f));
        gSlider.draw(sliderPieceShape);
        gSlider.dispose();

        // 3. Draw cutout slot on the background image
        Shape bgCutoutShape = createPuzzlePieceShape(targetX, targetY, PIECE_SIZE);
        gBg.setColor(new Color(0, 0, 0, 180));
        gBg.fill(bgCutoutShape);
        gBg.setColor(new Color(255, 255, 255, 180));
        gBg.setStroke(new BasicStroke(1.5f));
        gBg.draw(bgCutoutShape);
        gBg.dispose();

        // 4. Encode images to PNG bytes and base64
        byte[] bgBytes = toPngBytes(bg);
        byte[] sliderBytes = toPngBytes(sliderImg);

        BufferDto bgBuffer = toBufferDto(bgBytes);
        BufferDto sliderBuffer = toBufferDto(sliderBytes);

        String bgDataUri = "data:image/png;base64," + Base64.getEncoder().encodeToString(bgBytes);
        String sliderDataUri = "data:image/png;base64," + Base64.getEncoder().encodeToString(sliderBytes);

        challenges.put(challengeId, new ChallengeData(challengeId, targetX));

        return new CaptchaChallengeResponse(challengeId, bgBuffer, sliderBuffer, bgDataUri, sliderDataUri, targetY);
    }

    public String verifyChallenge(String challengeId, double userX) {
        ChallengeData challenge = challenges.remove(challengeId);
        if (challenge == null || challenge.isExpired()) {
            return null;
        }

        if (Math.abs(userX - challenge.getSolutionX()) <= TOLERANCE) {
            String token = UUID.randomUUID().toString();
            validTokens.put(token, System.currentTimeMillis());
            return token;
        }

        return null;
    }

    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        Long createdAt = validTokens.remove(token);
        if (createdAt == null) {
            return false;
        }
        // Token valid for 5 minutes
        return (System.currentTimeMillis() - createdAt) <= 300_000L;
    }

    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredChallenges() {
        long now = System.currentTimeMillis();
        challenges.entrySet().removeIf(entry -> now - entry.getValue().getCreatedAt() > 120_000L);
        validTokens.entrySet().removeIf(entry -> now - entry.getValue() > 300_000L);
    }

    private Shape createPuzzlePieceShape(double x, double y, double size) {
        double r = size / 5.0;
        Path2D.Double path = new Path2D.Double();
        path.moveTo(x, y);

        // Top tab
        path.lineTo(x + size / 2.0 - r, y);
        path.curveTo(x + size / 2.0 - r, y - r * 1.5, x + size / 2.0 + r, y - r * 1.5, x + size / 2.0 + r, y);
        path.lineTo(x + size, y);

        // Right tab
        path.lineTo(x + size, y + size / 2.0 - r);
        path.curveTo(x + size + r * 1.5, y + size / 2.0 - r, x + size + r * 1.5, y + size / 2.0 + r, x + size, y + size / 2.0 + r);
        path.lineTo(x + size, y + size);

        // Bottom edge
        path.lineTo(x + size / 2.0 + r, y + size);
        path.curveTo(x + size / 2.0 + r, y + size - r * 1.5, x + size / 2.0 - r, y + size - r * 1.5, x + size / 2.0 - r, y + size);
        path.lineTo(x, y + size);

        // Left edge
        path.lineTo(x, y);
        path.closePath();

        return path;
    }

    private byte[] toPngBytes(BufferedImage image) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to encode captcha image to PNG", e);
        }
    }

    private BufferDto toBufferDto(byte[] bytes) {
        int[] data = new int[bytes.length];
        for (int i = 0; i < bytes.length; i++) {
            data[i] = bytes[i] & 0xFF;
        }
        return new BufferDto(data);
    }
}
