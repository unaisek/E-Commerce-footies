const Order = require('../models/orderModel');

// total amount
const totalRevenue = async()=>{
    const revenue = await Order.aggregate([
        {
            $match: { 
                status: { 
                  $eq:"Delivered"
                }
            } 
        },
        {
            $group: 
            {
                _id: null,
                revenue: { $sum: "$totalAmount"}
            }
        }
    ])
    const totalRevenue = revenue.length > 0? revenue[0].revenue : 0
    return totalRevenue;
}

// payment method

const paymentMethod = async()=>{
    const totalPayment = await Order.aggregate([
        {
            $match : { status: { $eq: "Delivered"} }
        },
        {
            $group: {
                _id: "$paymentMethod",
                amount: { $sum: "$totalAmount" }
            }
        }
    ])
    const result = totalPayment.length > 0 ? totalPayment : 0
    return result
};

//  daily Chart 

const dailyChart = async()=>{
    const dailyOrder = await Order.aggregate([
        {
            $match: { status: { $eq: "Delivered"} }
        },
        {
            $group:{
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" }},
                dailyRevenue: { $sum: "$totalAmount"}
            }
        },
        {
            $sort: { _id: 1 }
        },
        {
            $limit: 14
        }
    ])
    const result = dailyOrder || 0
    return result;
}

//  monthly total revenue
const monthlyTotalRevenue = async(currMonthStartDate, now)=>{
    const monthlyToatalRevenue = await Order.aggregate([
        {
            $match: 
            {
                date: {
                    $gt: currMonthStartDate,
                    $lt: now
                },
                status: 
                {
                    $eq: "Delivered"
                }
            }
        },
        {
            $group:
            {
                _id: null,
                monthlyToatalRevenue:
                {
                    $sum : "$totalAmount"
                }
            }
        }
    ]);
    const result = monthlyToatalRevenue.length > 0 ? monthlyToatalRevenue[0].monthlyToatalRevenue : 0 ;
    return result;
}

module.exports ={
    totalRevenue,
    paymentMethod,
    dailyChart,
    monthlyTotalRevenue,
}