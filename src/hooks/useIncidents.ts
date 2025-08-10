// frontend/src/hooks/useIncidents.ts
import { useState, useCallback } from 'react';
import { incidentsAPI } from '../services/api';
import type { Incident } from '../types';

export function useIncidents() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createIncident = useCallback(async (
    incident: Omit<Incident, 'id' | 'userId' | 'submittedOn' | 'lastUpdated' | 'status'>
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await incidentsAPI.create(incident);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to create incident';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getIncidents = useCallback(async (params?: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await incidentsAPI.getAll(params);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch incidents';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateIncidentStatus = useCallback(async (
    id: string,
    status: string,
    notes?: string,
    assignedTo?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await incidentsAPI.updateStatus(id, status, notes, assignedTo);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to update incident';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkIncidentStatus = useCallback(async (incidentId: string) => {
    try {
      return await incidentsAPI.checkStatus(incidentId);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Incident not found';
      throw new Error(errorMessage);
    }
  }, []);

  return {
    createIncident,
    getIncidents,
    updateIncidentStatus,
    checkIncidentStatus,
    loading,
    error
  };
}