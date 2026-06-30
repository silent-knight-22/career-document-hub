import { saveSignedDocument } from '../services/documentService';
import toast from 'react-hot-toast';

export async function mergeAndDownload({
  userId,
  doc,
  docImage,
  placed,
  signatures,
  zoom,
  canvasEl,
  onStart,
  onComplete
}) {
  if (placed.length === 0) {
    toast.error('Place at least one signature on the document');
    return;
  }
  if (onStart) onStart();

  const canvas = document.createElement('canvas');
  const img = new window.Image();
  img.onload = () => {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const scaleX = img.naturalWidth / (canvasEl.offsetWidth / zoom);
    const scaleY = img.naturalHeight / (canvasEl.offsetHeight / zoom);

    const loadSig = (placedSig) => new Promise((res) => {
      const sig = signatures.find((s) => s.id === placedSig.sigId);
      if (!sig) return res();
      const sigImg = new window.Image();
      sigImg.onload = () => {
        ctx.drawImage(sigImg, placedSig.x * scaleX, placedSig.y * scaleY, placedSig.w * scaleX, placedSig.h * scaleY);
        res();
      };
      sigImg.src = sig.dataUrl;
    });

    Promise.all(placed.map(loadSig)).then(() => {
      const result = canvas.toDataURL('image/png');
      saveSignedDocument(userId, doc.id, result);

      // Download
      const a = document.createElement('a');
      a.href = result;
      a.download = `signed_${doc.name.replace(/\.[^.]+$/, '')}.png`;
      a.click();

      toast.success('Document signed and downloaded! 🎉');
      if (onComplete) onComplete();
    });
  };
  img.src = docImage;
}
