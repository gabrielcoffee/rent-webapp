import { supabase } from '@/client/supabase';

export class ImageUploadService {
    private static async uploadToBucket(file: File, baseName: string, bucketName: string): Promise<string> {
        try {
            // 1. Validar tamanho (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Imagem deve ter no máximo 5MB');
            }

            // 2. Validar tipo
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                throw new Error('Formato não suportado. Use PNG, JPEG, JPG ou WebP');
            }

            // 3. Converter para WebP se necessário (melhor compressão)
            const processedFile = await this.convertToWebP(file);

            // 4. Gerar nome do arquivo baseado no nome
            const fileName = this.generateFileName(baseName);

            // 5. Upload para Supabase Storage
            const { error } = await supabase.storage
                .from(bucketName)
                .upload(fileName, processedFile, {
                    cacheControl: '3600',
                    upsert: true // Sobrescreve se já existir
                });

            if (error) {
                console.error('Erro no upload:', error);
                throw new Error('Falha no upload da imagem');
            }

            // 6. Retornar URL pública
            const { data: publicData } = supabase.storage
                .from(bucketName)
                .getPublicUrl(fileName);

            return publicData.publicUrl;
        } catch (error) {
            console.error('Erro no upload da imagem:', error);
            throw error;
        }
    }

    static async uploadItemImage(file: File, itemName: string): Promise<string> {
        return await this.uploadToBucket(file, itemName, 'item-images');
    }

    static async uploadCondominioImage(file: File, condominioName: string): Promise<string> {
        return await this.uploadToBucket(file, condominioName, 'condominio-images');
    }

    private static async convertToWebP(file: File): Promise<File> {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Redimensionar se necessário (máximo 1920px de largura)
                const maxWidth = 1920;
                let { width, height } = img;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                // Desenhar imagem redimensionada
                ctx?.drawImage(img, 0, 0, width, height);

                // Converter para WebP com qualidade 85%
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                                type: 'image/webp'
                            });
                            resolve(webpFile);
                        } else {
                            reject(new Error('Falha na conversão para WebP'));
                        }
                    },
                    'image/webp',
                    0.85
                );
            };

            img.onerror = () => reject(new Error('Erro ao carregar imagem'));
            img.src = URL.createObjectURL(file);
        });
    }

    private static generateFileName(itemName: string): string {
        // Converter nome para formato: camera_de_filmagem_sony_x02
        return itemName
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
            .replace(/\s+/g, '_') // Substitui espaços por underscore
            .replace(/_+/g, '_') // Remove underscores duplicados
            .replace(/^_|_$/g, '') // Remove underscores do início e fim
            + '_' + Date.now() + '.webp'; // Adiciona timestamp para evitar conflitos
    }

    static async deleteImage(imageUrl: string): Promise<void> {
        try {
            // Extrair nome do arquivo da URL
            const urlParts = imageUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];

            const { error } = await supabase.storage
                .from('item-images')
                .remove([fileName]);

            if (error) {
                console.error('Erro ao deletar imagem:', error);
                // Não lançar erro aqui, pois a imagem pode já ter sido deletada
            }
        } catch (error) {
            console.error('Erro ao deletar imagem:', error);
            // Não lançar erro aqui, pois não é crítico
        }
    }
}
