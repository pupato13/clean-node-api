export default {
    // mongodb://MONGO:27017
    // MONGO -> the name used on docker.compose file
    mongoUrl: process.env.MONGO_URL || "mongodb://mongo:27017/clean-node-api",
    port: process.env.PORT || 5050,
    jwtSecret: process.env.JWT_SECRET || "5|sp{9DP5jj47<mN",
};
