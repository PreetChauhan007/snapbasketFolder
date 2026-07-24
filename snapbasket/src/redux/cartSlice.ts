import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IGrocery {
    _id: string,
    name: string,
    category: string,
    price: string,
    unit: string,
    quantity: number,
    image: string,
    createdAt?: Date,
    updatedAt?: Date
}

interface ICartSlice {
    cartData: IGrocery[],
    subTotal: number,
    deliveryFee: number,
    finalTotal: number
}

const initialState: ICartSlice = {
    cartData: [],
    subTotal: 0,
    deliveryFee: 25,
    finalTotal: 25
}

// 👇 plain helper function, slice ke bahar
function calculateTotals(state: ICartSlice) {
    state.subTotal = state.cartData.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
    state.deliveryFee = state.subTotal >= 99 ? 0 : 25
    state.finalTotal = state.subTotal + state.deliveryFee
}

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<IGrocery>) => {
            state.cartData.push(action.payload)
            calculateTotals(state)
        },
        increaseQuantity: (state, action: PayloadAction<string>) => {
            const item = state.cartData.find(i => i._id === action.payload)
            if (item) {
                item.quantity = item.quantity + 1
            }
            calculateTotals(state)
        },
        decreaseQuantity: (state, action: PayloadAction<string>) => {
            const item = state.cartData.find(i => i._id === action.payload)
            if (item?.quantity && item.quantity > 1) {
                item.quantity = item.quantity - 1
            } else {
                state.cartData = state.cartData.filter(i => i._id !== action.payload)
            }
            calculateTotals(state)
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.cartData = state.cartData.filter(i => i._id !== action.payload)
            calculateTotals(state)
        }
    }
})

export const { addToCart, increaseQuantity, decreaseQuantity, removeFromCart } = cartSlice.actions
export default cartSlice.reducer
