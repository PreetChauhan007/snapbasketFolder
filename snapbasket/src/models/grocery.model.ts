import mongoose from "mongoose";

export interface IGrocery{
    _id?:mongoose.Types.ObjectId,
    name:string,
    category:string,
    price:string,
    unit:string,
    image:string,
    stock:number,
    createdAt?:Date,
    updatedAt?:Date
}

const grocerySchema=new mongoose.Schema<IGrocery>({
    name:{
        type:String,
        required:true
    },
    category:{
        type:String,
        enum:[
            "Fruits & Veggies",
            "Dairy & Eggs",
            "Rice, Atta, Dal & More",
            "Oil, Ghee & Masala",
            "Biscuits & Cookies",
            "Hot & Cold Beverages",
            "Instant & Frozen Food",
            "Namkeen & Chips",
            "Baby Care",
            "Household Essentials",
            "Home Appliances"
        ],
        required:true
    },
    price:{
        type:String,
        required:true
    },
    unit:{
        type:String,
        required:true,
        enum:[
            "kg","g","L","ml","piece","pack"
        ]
    },
    image:{
        type:String,
        required:true
    },
    stock:{
        type:Number,
        required:true,
        min:0,
        default:0
    },
},{
    timestamps:true
})


const Grocery=mongoose.models.Grocery || mongoose.model("Grocery",grocerySchema)
export default Grocery
