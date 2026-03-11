import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface BatchCheckDocument {
  id: string;
  doc_name: string;
  level_id: string;
  level_name: string;
  project_year: number;
  department_name: string;
}

interface BatchCheckState {
  documents: BatchCheckDocument[];
}

const initialState: BatchCheckState = {
  documents: [],
};

const batchCheckSlice = createSlice({
  name: 'batchCheck',
  initialState,
  reducers: {
    setBatchCheckDocuments: (state, action: PayloadAction<BatchCheckDocument[]>) => {
      state.documents = action.payload;
    },
    clearBatchCheckDocuments: (state) => {
      state.documents = [];
    },
  },
});

export const { setBatchCheckDocuments, clearBatchCheckDocuments } = batchCheckSlice.actions;
export default batchCheckSlice.reducer;
