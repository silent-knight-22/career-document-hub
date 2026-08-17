package com.careerdocumenthub.storage;

import com.careerdocumenthub.common.exception.InvalidFileException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UploadValidatorTest {

    private final UploadValidator validator = new UploadValidator();

    @Test
    void acceptsPdfByMagicBytes() {
        byte[] pdf = TestFileFixtures.pdfBytes(100);
        ValidatedUpload result = validator.validate(
                new MockMultipartFile("file", "doc.pdf", "application/octet-stream", pdf),
                5 * 1024 * 1024);
        assertThat(result.type()).isEqualTo("pdf");
        assertThat(result.contentType()).isEqualTo("application/pdf");
    }

    @Test
    void acceptsPngAsImage() {
        byte[] png = TestFileFixtures.pngBytes(50);
        ValidatedUpload result = validator.validate(
                new MockMultipartFile("file", "x.png", "image/png", png),
                5 * 1024 * 1024);
        assertThat(result.type()).isEqualTo("image");
    }

    @Test
    void rejectsUnknownMagic() {
        assertThatThrownBy(() -> validator.validate(
                new MockMultipartFile("file", "x.bin", "application/octet-stream", new byte[]{1, 2, 3, 4}),
                5 * 1024 * 1024))
                .isInstanceOf(InvalidFileException.class);
    }

    @Test
    void rejectsOversized() {
        byte[] pdf = TestFileFixtures.pdfBytes(200);
        assertThatThrownBy(() -> validator.validate(
                new MockMultipartFile("file", "big.pdf", "application/pdf", pdf),
                100))
                .isInstanceOf(InvalidFileException.class)
                .hasMessageContaining("too large");
    }

    @Test
    void rejectsEmpty() {
        assertThatThrownBy(() -> validator.validate(
                new MockMultipartFile("file", "empty.pdf", "application/pdf", new byte[0]),
                1024))
                .isInstanceOf(InvalidFileException.class);
    }
}
