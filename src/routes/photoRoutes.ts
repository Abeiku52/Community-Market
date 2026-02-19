import { Router, Response } from 'express';
import multer from 'multer';
import listingService from '../services/listingService';
import storageService from '../utils/storage';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ValidationError, validateRequired } from '../utils/validation';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Upload photo to listing
router.post(
  '/:id/photos',
  authenticate,
  upload.single('file'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Check if listing exists and user owns it
      const listing = await listingService.findById(id);
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      if (listing.sellerId !== req.user!.id) {
        return res.status(403).json({ error: 'You do not have permission to add photos to this listing' });
      }

      // Check photo count limit (max 8 photos)
      const photoCount = await listingService.getPhotoCount(id);
      if (photoCount >= 8) {
        return res.status(400).json({ error: 'Maximum of 8 photos allowed per listing' });
      }

      // Validate file
      storageService.validateImageFile(file);

      // Upload to S3
      const photoUrl = await storageService.uploadFile(file, 'listings');

      // Get display order (next available)
      const displayOrder = photoCount;

      // Save photo record
      const photo = await listingService.addPhoto({
        listingId: id,
        photoUrl,
        displayOrder,
      });

      res.status(201).json({ photo });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Upload photo error:', error);
        res.status(500).json({ error: 'Failed to upload photo' });
      }
    }
  }
);

// Delete photo from listing
router.delete(
  '/:listingId/photos/:photoId',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const { listingId, photoId } = req.params;

      // Check if listing exists and user owns it
      const listing = await listingService.findById(listingId);
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      if (listing.sellerId !== req.user!.id) {
        return res.status(403).json({ error: 'You do not have permission to delete photos from this listing' });
      }

      // Get photo
      const photo = await listingService.getPhotoById(photoId);
      if (!photo) {
        return res.status(404).json({ error: 'Photo not found' });
      }

      if (photo.listingId !== listingId) {
        return res.status(400).json({ error: 'Photo does not belong to this listing' });
      }

      // Delete from S3
      try {
        await storageService.deleteFile(photo.photoUrl);
      } catch (error) {
        console.error('Failed to delete from S3:', error);
        // Continue with database deletion even if S3 deletion fails
      }

      // Delete from database
      await listingService.deletePhoto(photoId);

      res.json({ success: true, message: 'Photo deleted successfully' });
    } catch (error) {
      console.error('Delete photo error:', error);
      res.status(500).json({ error: 'Failed to delete photo' });
    }
  }
);

// Reorder photos
router.put(
  '/:id/photos/reorder',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { photoOrder } = req.body;

      // Check if listing exists and user owns it
      const listing = await listingService.findById(id);
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      if (listing.sellerId !== req.user!.id) {
        return res.status(403).json({ error: 'You do not have permission to reorder photos for this listing' });
      }

      validateRequired(photoOrder, 'Photo order');

      if (!Array.isArray(photoOrder)) {
        throw new ValidationError('Photo order must be an array of photo IDs');
      }

      // Update display order for each photo
      for (let i = 0; i < photoOrder.length; i++) {
        const photoId = photoOrder[i];
        await listingService.updatePhotoOrder(photoId, i);
      }

      res.json({ success: true, message: 'Photos reordered successfully' });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Reorder photos error:', error);
        res.status(500).json({ error: 'Failed to reorder photos' });
      }
    }
  }
);

export default router;
