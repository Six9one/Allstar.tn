// ⚡ High-Precision AI Background Removal & Studio Backdrop Engine for All-Star Academy
import { removeBackground } from '@imgly/background-removal';

export const ALLSTAR_BACKDROPS = [
  { id: 'blue', name: 'الأزرق النيون (Electric Blue)', colors: ['#00E5FF', '#0077C2', '#0A1628'] },
  { id: 'gold', name: 'الذهبي البطولي (Gold Champion)', colors: ['#FFD54F', '#FFA000', '#211700'] },
  { id: 'green', name: 'الأخضر الرياضي (Vivid Green)', colors: ['#69F0AE', '#00A152', '#042211'] },
  { id: 'navy', name: 'الأزرق الملكي (Royal Navy)', colors: ['#90CAF9', '#1565C0', '#060B19'] }
];

// In-memory cache for extracted transparent cutouts
const cutoutCache = new Map();

export class PhotoStudioEngine {
  /**
   * Helper to convert File/Blob objects to permanent DataURLs
   */
  static readFileAsDataURL(file) {
    return new Promise((resolve) => {
      if (typeof file === 'string') return resolve(file);
      if (!file || !(file instanceof Blob || file instanceof File)) return resolve('');
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }

  /**
   * Precise AI Subject Extraction & Background Removal
   */
  static async removeBgAI(input, onProgress) {
    const rawDataUrl = await this.readFileAsDataURL(input);
    if (!rawDataUrl) return '';

    if (cutoutCache.has(rawDataUrl)) {
      return cutoutCache.get(rawDataUrl);
    }

    try {
      if (onProgress) onProgress('⚡ إزالة الخلفية بالذكاء الاصطناعي...');

      let blobInput = input;
      if (typeof input === 'string') {
        const response = await fetch(input);
        blobInput = await response.blob();
      }

      const transparentBlob = await removeBackground(blobInput, {
        progress: (key, current, total) => {
          if (onProgress && total > 0) {
            const pct = Math.round((current / total) * 100);
            onProgress(`⚡ تفكيك الخلفية (${pct}%)...`);
          }
        }
      });

      const transparentDataUrl = await this.readFileAsDataURL(transparentBlob);
      if (transparentDataUrl) {
        cutoutCache.set(rawDataUrl, transparentDataUrl);
        return transparentDataUrl;
      }
    } catch (err) {
      console.warn('AI BG removal warning, using canvas fallback:', err);
    }

    return rawDataUrl;
  }

  /**
   * Fast HD photo optimization preserving original background
   */
  static async optimizePhoto(input, options = {}) {
    const { targetSize = 400, quality = 0.85 } = options;
    const baseDataUrl = await this.readFileAsDataURL(input);
    if (!baseDataUrl) {
      return 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=400&auto=format&fit=crop&q=80';
    }

    return new Promise((resolve) => {
      const img = new Image();
      if (typeof baseDataUrl === 'string' && baseDataUrl.startsWith('http')) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let w = img.naturalWidth || img.width;
          let h = img.naturalHeight || img.height;
          const maxDim = targetSize;

          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }

          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/webp', quality);
          resolve(dataUrl);
        } catch (e) {
          resolve(baseDataUrl);
        }
      };

      img.onerror = () => {
        resolve(baseDataUrl);
      };

      img.src = baseDataUrl;
    });
  }

  /**
   * High-Precision Studio Processing: AI Cutout + Backdrop & Lighting
   */
  static async processPhoto(input, options = {}) {
    const {
      targetSize = 400,
      quality = 0.85,
      backdropId = 'blue',
      onProgress = null
    } = options;

    if (onProgress) onProgress('جاري تحضير الاستوديو...');

    const baseDataUrl = await this.readFileAsDataURL(input);
    if (!baseDataUrl) {
      return { dataUrl: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=400&auto=format&fit=crop&q=80', backdrop: 'blue' };
    }

    // Step 1: Precise AI background removal
    const cutoutUrl = await this.removeBgAI(input, onProgress);

    const backdrop = ALLSTAR_BACKDROPS.find(b => b.id === backdropId) || ALLSTAR_BACKDROPS[0];

    if (onProgress) onProgress('تركيب الخلفية والإضاءة...');

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');

          // Draw studio background gradient
          const grad = ctx.createRadialGradient(
            targetSize / 2, targetSize / 2.2, targetSize * 0.1,
            targetSize / 2, targetSize / 2, targetSize * 0.75
          );
          grad.addColorStop(0, backdrop.colors[0]);
          grad.addColorStop(0.5, backdrop.colors[1]);
          grad.addColorStop(1, backdrop.colors[2]);

          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, targetSize, targetSize);

          // Spotlight Overlay
          const spotGrad = ctx.createRadialGradient(
            targetSize / 2, targetSize * 0.35, 0,
            targetSize / 2, targetSize * 0.35, targetSize * 0.65
          );
          spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
          spotGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.05)');
          spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
          ctx.fillStyle = spotGrad;
          ctx.fillRect(0, 0, targetSize, targetSize);

          // Calculate dimensions and position subject
          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;
          const aspect = w / h;

          let drawW = targetSize * 0.88;
          let drawH = drawW / aspect;

          if (drawH < targetSize * 0.92) {
            drawH = targetSize * 0.92;
            drawW = drawH * aspect;
          }

          const drawX = (targetSize - drawW) / 2;
          const drawY = targetSize - drawH;

          // Drop shadow for subject
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
          ctx.shadowBlur = 18;
          ctx.shadowOffsetY = 8;
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          ctx.restore();

          // Draw subject
          ctx.drawImage(img, drawX, drawY, drawW, drawH);

          const dataUrl = canvas.toDataURL('image/webp', quality);
          resolve({ dataUrl, backdrop: backdrop.id });

        } catch (err) {
          console.error('Studio Processing Error:', err);
          resolve({ dataUrl: baseDataUrl, backdrop: backdrop.id });
        }
      };

      img.onerror = () => {
        resolve({ dataUrl: baseDataUrl, backdrop: backdrop.id });
      };

      img.src = cutoutUrl;
    });
  }
}
