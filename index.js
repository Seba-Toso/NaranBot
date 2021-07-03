const {Telegraf} = require('telegraf')
const axios = require('axios')

const Naranbot = new Telegraf('1770021338:AAFW_SYPZDxtQYSpS34exIkoQ1D8lXVFCao')


Naranbot.start((ctx) => {
    console.log(ctx);
    const user = ctx.from.first_name
    const message = ctx.startPayload
    ctx.reply(`Qué verga queres ${user}?`)
    ctx.reply(`Esto no me sirve: ${message}`)
})

Naranbot.help((ctx)=>{
    ctx.reply('No te voy a ayudar una mierda')
})


Naranbot.command(['Habilita', 'habilita', 'Decime', 'decime', 'get', 'Get'], (ctx)=>{

    const message = ctx.message.text
    const crypto = message.split(' ')[1].toUpperCase()
    const uri = `https://api.coinbase.com/v2/prices/${crypto}-USD/buy`
    
    //console.log(crypto); 

    getPrice(uri)
    .then( res => {
        //console.log(res)
        const {amount} = res.data
        ctx.reply(`Ahí tenés, no me rompas más los huevos`)
        ctx.replyWithHTML(`1 <b>${crypto}</b> -- <b>${amount}</b>usd`)
    })
    .catch(err => {
        console.log(err);
        ctx.reply('Perdón, estaba cagando y no te dí pelota')
    })
})

const getPrice = async (uri) => {
    try {
        const response = await axios(uri)
        const {data} = response
        //console.log(data);
        return data
    } catch (error) {
        console.log(error)
    }
}


Naranbot.launch()