import prisma from '../prisma/client';
import { Prisma } from '@prisma/client';

/**
 * Create a new product
 */
export async function createProduct(data: Prisma.ProductCreateInput) {
    return await prisma.product.create({ data });
}

/**
 * Update an existing product by ID
 */
export async function updateProduct(id: string, data: Prisma.ProductUpdateInput) {
    return await prisma.product.update({
        where: { id },
        data,
    });
}

/**
 * Get a single product by ID
 */
export async function getProductById(id: string) {
    return await prisma.product.findUnique({
        where: { id },
    });
}

/**
 * List products with optional filtering
 */
export async function listProducts(filter?: { activeOnly?: boolean }) {
    const where: Prisma.ProductWhereInput = {};

    if (filter?.activeOnly) {
        where.active = true;
    }

    return await prisma.product.findMany({
        where,
        orderBy: { name: 'asc' },
    });
}

/**
 * Delete a product by ID (hard delete)
 */
export async function deleteProduct(id: string) {
    return await prisma.product.delete({
        where: { id },
    });
}
