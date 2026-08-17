package com.careerdocumenthub.storage;

/**
 * Shared magic-byte fixtures for upload/storage tests.
 */
public final class TestFileFixtures {

    private TestFileFixtures() {
    }

    public static byte[] pdfBytes(int size) {
        byte[] bytes = new byte[Math.max(size, 8)];
        bytes[0] = 0x25;
        bytes[1] = 0x50;
        bytes[2] = 0x44;
        bytes[3] = 0x46;
        return bytes;
    }

    public static byte[] pngBytes(int size) {
        byte[] bytes = new byte[Math.max(size, 8)];
        bytes[0] = (byte) 0x89;
        bytes[1] = 0x50;
        bytes[2] = 0x4e;
        bytes[3] = 0x47;
        return bytes;
    }
}
