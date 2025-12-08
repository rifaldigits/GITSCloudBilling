import prisma from '../prisma/client';
import { Prisma, ClientStatus } from '@prisma/client';

/**
 * Create a new client
 */
export async function createClient(data: Prisma.ClientCreateInput) {
    return await prisma.client.create({ data });
}

/**
 * Update an existing client by ID
 */
export async function updateClient(id: string, data: Prisma.ClientUpdateInput) {
    return await prisma.client.update({
        where: { id },
        data,
    });
}

/**
 * Get a single client by ID
 */
export async function getClientById(id: string) {
    return await prisma.client.findUnique({
        where: { id },
    });
}

/**
 * List clients with optional filtering by status
 */
export async function listClients(filter?: { status?: ClientStatus }) {
    const where: Prisma.ClientWhereInput = {};

    if (filter?.status) {
        where.status = filter.status;
    }

    return await prisma.client.findMany({
        where,
        orderBy: { name: 'asc' },
    });
}

/**
 * Delete a client by ID (hard delete)
 */
export async function deleteClient(id: string) {
    return await prisma.client.delete({
        where: { id },
    });
}
