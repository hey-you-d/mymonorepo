// src/viewModels/useUserViewModel.ts

// The ViewModel manages state and business logic, bridging the model and the view. 

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SimpleCartInventoryModel } from '../models/SimpleCartInventoryModel';
import { SimpleCartProductInfo } from '../types/SimpleCart';

export const useSimpleCartViewModel = () => {
  const [inventory, setInventory] = useState<SimpleCartProductInfo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Memoize userModel so it is created only once unless apiClient changes
  const simpleCardInventoryModel = useMemo(() => new SimpleCartInventoryModel(), []);

  const fetchInventory = useCallback(() => {
    setLoading(true);
    try {
      const inventories: SimpleCartProductInfo[] = simpleCardInventoryModel.fetchInventories();
      setInventory(inventories);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }, [simpleCardInventoryModel]);
  
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);
  
  return {
    inventory,
    loading,
    resetInventory: fetchInventory,
  };
};
