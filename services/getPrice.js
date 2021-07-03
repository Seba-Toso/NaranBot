const axios = require('axios')

const getPrice = async (uri) => {
    try {
        const response = await axios(uri)
        const {data} = response
        //console.log(data);
        return data
    } catch (error) {
        //console.log(error)
        return error
    }
}



module.exports = (getPrice)