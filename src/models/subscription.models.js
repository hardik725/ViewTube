import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    
},
{timestamps: true}
)

export const Subscription = mongoose.model("Subscription",subscriptionSchema);


// aggregation pipeline

// it consist of many stages where the document that comes out as output from one state is taken as input in the other stage
// here the stages are present simultaneously and together form a aggregate network