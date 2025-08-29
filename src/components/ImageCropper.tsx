import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Save, RotateCw, Crop as CropIcon, Sliders } from 'lucide-react';
import { toast } from 'sonner';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  src: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (croppedImageBlob: Blob) => void;
  aspectRatio?: number;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  src,
  isOpen,
  onClose,
  onSave,
  aspectRatio
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspectRatio || width / height,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  }, [aspectRatio]);

  const getCroppedImg = useCallback(async (): Promise<Blob | null> => {
    const image = imgRef.current;
    const canvas = canvasRef.current;
    
    if (!image || !canvas || !completedCrop) {
      return null;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    
    // Apply rotation
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  }, [completedCrop, brightness, contrast, saturation, rotation]);

  const handleSave = async () => {
    try {
      const croppedBlob = await getCroppedImg();
      if (croppedBlob) {
        onSave(croppedBlob);
        onClose();
        toast.success('Image edited successfully');
      } else {
        toast.error('Failed to process image');
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Error processing image');
    }
  };

  const resetAdjustments = () => {
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5" />
            Edit Image
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              className="max-h-96"
            >
              <img
                ref={imgRef}
                src={src}
                alt="Crop me"
                onLoad={onImageLoad}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
                }}
                className="max-h-96 w-auto"
              />
            </ReactCrop>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <RotateCw className="h-4 w-4" />
                  Rotation: {rotation}°
                </label>
                <Slider
                  value={[rotation]}
                  onValueChange={(value) => setRotation(value[0])}
                  max={360}
                  min={0}
                  step={1}
                  className="mt-2"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Sliders className="h-4 w-4" />
                  Brightness: {brightness}%
                </label>
                <Slider
                  value={[brightness]}
                  onValueChange={(value) => setBrightness(value[0])}
                  max={200}
                  min={0}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Contrast: {contrast}%</label>
                <Slider
                  value={[contrast]}
                  onValueChange={(value) => setContrast(value[0])}
                  max={200}
                  min={0}
                  step={1}
                  className="mt-2"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Saturation: {saturation}%</label>
                <Slider
                  value={[saturation]}
                  onValueChange={(value) => setSaturation(value[0])}
                  max={200}
                  min={0}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={resetAdjustments}>
              Reset Adjustments
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};