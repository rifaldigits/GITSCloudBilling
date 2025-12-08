import { Request, Response } from 'express';
import * as productRepo from '../repositories/productRepository';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const activeOnly = req.query.active === 'true';
        const products = await productRepo.listProducts({ activeOnly });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await productRepo.getProductById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const product = await productRepo.createProduct(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create product' });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await productRepo.updateProduct(id, req.body);
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update product' });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await productRepo.deleteProduct(id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete product' });
    }
};
