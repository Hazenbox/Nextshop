import { nanoid } from 'nanoid';
import { Image } from '../types';
import { inventoryStorage } from './inventory';

const DB_NAME = 'moodboard';
const DB_VERSION = 1;
const STORE_NAME = 'images';

export class ImageStorage {
  private db: IDBDatabase | null = null;
  private dbInitPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.dbInitPromise) {
      return this.dbInitPromise;
    }

    this.dbInitPromise = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
          console.error('Database error:', request.error);
          this.db = null;
          this.dbInitPromise = null;
          reject(new Error('Failed to open database'));
        };
        
        request.onsuccess = () => {
          this.db = request.result;
          
          this.db.onclose = () => {
            this.db = null;
            this.dbInitPromise = null;
          };
          
          this.db.onerror = (event) => {
            console.error('Database error:', (event.target as IDBDatabase).error);
          };
          
          resolve();
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('boardId', 'board_id', { unique: false });
          }
        };
      } catch (error) {
        console.error('Error initializing database:', error);
        this.db = null;
        this.dbInitPromise = null;
        reject(error);
      }
    });

    return this.dbInitPromise;
  }

  private async ensureConnection(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      throw new Error('Database connection failed');
    }
  }

  private getStore(mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
  }

  async addImage(boardId: string, file: File): Promise<Image> {
    await this.ensureConnection();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const image: Image = {
            id: nanoid(),
            url: reader.result as string,
            description: file.name,
            board_id: boardId,
            storage_path: `${boardId}/${file.name}`,
            created_at: new Date()
          };

          const store = this.getStore('readwrite');
          
          const request = store.add(image);

          request.onsuccess = () => resolve(image);
          request.onerror = () => {
            console.error('Error adding image:', request.error);
            reject(new Error('Failed to save image'));
          };
        } catch (error) {
          console.error('Error in addImage:', error);
          reject(error);
        }
      };

      reader.onerror = () => {
        console.error('FileReader error:', reader.error);
        reject(new Error('Failed to read image file'));
      };

      reader.readAsDataURL(file);
    });
  }

  async getImages(boardId: string): Promise<Image[]> {
    await this.ensureConnection();

    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore();
        const index = store.index('boardId');
        const request = index.getAll(boardId);

        request.onsuccess = () => {
          const images = request.result || [];
          resolve(images);
        };

        request.onerror = () => {
          console.error('Error getting images:', request.error);
          reject(new Error('Failed to fetch images'));
        };
      } catch (error) {
        console.error('Error in getImages:', error);
        reject(error);
      }
    });
  }

  async deleteImage(id: string): Promise<void> {
    await this.ensureConnection();

    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('readwrite');
        const request = store.delete(id);

        request.onsuccess = () => {
          // Remove image reference from inventory items
          inventoryStorage.removeImageFromItems(id);
          resolve();
        };

        request.onerror = () => {
          console.error('Error deleting image:', request.error);
          reject(new Error('Failed to delete image'));
        };
      } catch (error) {
        console.error('Error in deleteImage:', error);
        reject(error);
      }
    });
  }

  async replaceImage(id: string, file: File): Promise<Image> {
    await this.ensureConnection();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const store = this.getStore('readwrite');
          const getRequest = store.get(id);
          
          getRequest.onsuccess = () => {
            const existingImage = getRequest.result;
            if (!existingImage) {
              reject(new Error('Image not found'));
              return;
            }

            const updatedImage: Image = {
              ...existingImage,
              url: reader.result as string,
              description: file.name,
              storage_path: `${existingImage.board_id}/${file.name}`,
            };

            const putRequest = store.put(updatedImage);
            
            putRequest.onsuccess = () => resolve(updatedImage);
            putRequest.onerror = () => {
              console.error('Error updating image:', putRequest.error);
              reject(new Error('Failed to update image'));
            };
          };
          
          getRequest.onerror = () => {
            console.error('Error getting image:', getRequest.error);
            reject(new Error('Failed to fetch image'));
          };
        } catch (error) {
          console.error('Error in replaceImage:', error);
          reject(error);
        }
      };

      reader.onerror = () => {
        console.error('FileReader error:', reader.error);
        reject(new Error('Failed to read image file'));
      };

      reader.readAsDataURL(file);
    });
  }
}

export const imageStorage = new ImageStorage();