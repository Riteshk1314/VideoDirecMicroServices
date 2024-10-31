
//IIFE
const app = express();
;(async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URL}${DB_NAME}` )
        app.on("error", (error) => {
            console.error(`Error: ${error}`)
        })
        app.listen(8000, () => {
            console.log("Server started at http://localhost:5000")
        })
    }
    catch(error) {
        console.error(error)
        throw new Error("Error in connecting to the database")
    }
})()