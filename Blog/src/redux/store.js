import { configureStore } from "@reduxjs/toolkit";
import blogReducer from "./features/blogSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // This uses localStorage for persistence

// Persist configuration for redux-persist
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["likedBlogs"], // Persist only the likedBlogs state
  // Optionally, you could use `blacklist` if needed in the future.
  // blacklist: ["someOtherStateToExclude"],
};

// Create a persisted reducer for blog
const persistedReducer = persistReducer(persistConfig, blogReducer);

const store = configureStore({
  reducer: {
    blog: persistedReducer, // Use the persisted reducer
  },
  // Disable serializability check for redux-persist actions
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"], // Ignore persist actions
      },
    }),
});

const persistor = persistStore(store); // Create a persistor

export { store, persistor }; // Export both store and persistor
