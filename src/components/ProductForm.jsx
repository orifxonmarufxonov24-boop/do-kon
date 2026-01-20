import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Button } from './ui/Button';
import { Input, Select } from './ui/Input';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';

const CATEGORIES = ['Unitaz', 'Vanna', 'Rakovina', 'Ko\'zgu', 'Jo\'mrak', 'Dush', 'Mebel', 'Aksessuarlar'];

export default function ProductForm({ onClose, showSuccess, initialData = null }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialData || {
        name: '',
        category: 'Unitaz',
        sizes: '',
        color: '',
        quantity: 0,
        images: []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const processImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    // Resize to max 1000px (High Quality but safe for Firestore)
                    const MAX_SIZE = 1000;
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8)); // Quality 80%
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleImageChange = async (e) => {
        if (formData.images.length >= 3) {
            alert("Maksimal 3 ta rasm yuklash mumkin.");
            return;
        }

        const files = Array.from(e.target.files);
        setLoading(true);

        try {
            const newImages = [];
            for (const file of files) {
                if (file.size > 5 * 1024 * 1024) {
                    alert(`Fayl juda katta: ${file.name}. 5MB dan kichik rasm yuklang.`);
                    continue;
                }
                const base64 = await processImage(file);
                newImages.push(base64);
            }

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newImages].slice(0, 3)
            }));
        } catch (err) {
            console.error(err);
            alert("Rasmni qayta ishlashda xatolik.");
        } finally {
            setLoading(false);
            e.target.value = ''; // Reset input
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const productData = {
                name: formData.name,
                category: formData.category,
                sizes: typeof formData.sizes === 'string' ? formData.sizes.split(',').map(s => s.trim()).filter(Boolean) : formData.sizes,
                color: formData.color,
                quantity: parseInt(formData.quantity),
                images: formData.images,
                updatedAt: new Date(),
                searchKeywords: [
                    formData.name.toLowerCase(),
                    formData.category.toLowerCase(),
                    formData.color.toLowerCase()
                ]
            };

            if (initialData) {
                await updateDoc(doc(db, "products", initialData.id), productData);
            } else {
                await addDoc(collection(db, "products"), {
                    ...productData,
                    createdAt: new Date()
                });
            }

            showSuccess(initialData ? 'Mahsulot yangilandi!' : 'Mahsulot yaratildi!');
            onClose();
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Xatolik yuz berdi: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Mahsulot Nomi"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="masalan: Hashamatli Keramika Unitaz"
                />
                <Select
                    label="Kategoriya"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                    label="O'lchamlar (vergul bilan ajrating)"
                    name="sizes"
                    value={formData.sizes}
                    onChange={handleChange}
                    placeholder="masalan: S, M, L yoki 50cm, 60cm"
                />
                <Input
                    label="Rangi"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="masalan: Oq, Qora Matt"
                />
                <Input
                    label="Soni"
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    min="0"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Mahsulot Rasmlari (Maksimal 3 ta)</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                    {formData.images.map((src, idx) => (
                        <div key={idx} className="relative group aspect-square bg-gray-100 dark:bg-black/20 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10">
                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <FaTimes size={12} />
                            </button>
                        </div>
                    ))}
                    {formData.images.length < 3 && (
                        <label className="border-2 border-dashed border-gray-300 dark:border-white/20 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-neon-blue hover:text-blue-500 dark:hover:text-neon-blue transition-colors text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-transparent">
                            {loading ? (
                                <span className="text-xs animate-pulse">Yuklanmoqda...</span>
                            ) : (
                                <>
                                    <FaCloudUploadAlt size={24} />
                                    <span className="text-xs mt-1">Tanlash</span>
                                </>
                            )}
                            <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" disabled={loading} />
                        </label>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
                <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Bekor qilish</Button>
                <Button type="submit" loading={loading}>{initialData ? 'Yangilash' : 'Yaratish'}</Button>
            </div>
        </form>
    );
}
