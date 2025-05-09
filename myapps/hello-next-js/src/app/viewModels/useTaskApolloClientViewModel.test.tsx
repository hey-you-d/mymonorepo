import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { useTaskApolloClientViewModel } from './useTaskApolloClientViewModel';
import { ApolloError, gql, useQuery, useMutation } from '@apollo/client';

// Test component to expose the hook
const TestComponent = ({ onRender }: { onRender: (vm: ReturnType<typeof useTaskApolloClientViewModel>) => void }) => {
  const vm = useTaskApolloClientViewModel();
  onRender(vm);
  return null;
};

