const initialState = {
  orders: [],
};

export { initialState };

export default function ordersReducer(state, action) {
  switch (action.type) {
    case "ADD_ORDER":
      return {
        ...state,
        orders: [action.payload, ...state.orders],
      };

    case "UPDATE_STATUS":
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.payload.id
            ? {
                ...order,
                status: action.payload.status,
              }
            : order,
        ),
      };

    case "CANCEL_ORDER":
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.payload
            ? {
                ...order,
                status: "Cancelled",
              }
            : order,
        ),
      };

    case "CLEAR_ORDERS":
      return {
        ...initialState,
      };

    case "LOAD_ORDERS":
      return {
        ...state,
        orders: action.payload,
      };

    default:
      return state;
  }
}
