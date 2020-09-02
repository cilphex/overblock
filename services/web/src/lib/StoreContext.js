import React from 'react';

const StoreContext = React.createContext({
  globalsStore: null,
  lndStore: null,
});

export default StoreContext;