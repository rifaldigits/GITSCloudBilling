import { Request, Response } from 'express';
import * as clientRepo from '../repositories/clientRepository';
import { ClientStatus } from '@prisma/client';

export const getClients = async (req: Request, res: Response) => {
    try {
        const filter = req.query.status ? { status: req.query.status as ClientStatus } : undefined;
        const clients = await clientRepo.listClients(filter);
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
};

export const getClientById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const client = await clientRepo.getClientById(id);
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.json(client);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch client' });
    }
};

export const createClient = async (req: Request, res: Response) => {
    try {
        const client = await clientRepo.createClient(req.body);
        res.status(201).json(client);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create client' });
    }
};

export const updateClient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const client = await clientRepo.updateClient(id, req.body);
        res.json(client);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update client' });
    }
};

export const deleteClient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await clientRepo.deleteClient(id);
        res.json({ message: 'Client deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete client' });
    }
};
